const { db } = require('../database/db');
const { 
  reactionRoleMessages, 
  reactionRoleOptions, 
  reactionRoleGroups,
  reactionRoleWhitelist,
  reactionRoleBlacklist,
  reactionRoleAssignments,
  roleAuditLogs
} = require('../database/schema');
const { eq, and, inArray, sql } = require('drizzle-orm');

/**
 * Handle reaction add event
 */
async function handleReactionAdd(reaction, user) {
  // Ignore bot reactions
  if (user.bot) return;

  try {
    // Fetch partial message if needed
    if (reaction.partial) {
      await reaction.fetch();
    }

    const { message } = reaction;
    const emoji = reaction.emoji.toString();

    // Check if this is a reaction role message
    const rrMessage = await db.select()
      .from(reactionRoleMessages)
      .where(and(
        eq(reactionRoleMessages.serverId, message.guild.id),
        eq(reactionRoleMessages.messageId, message.id),
        eq(reactionRoleMessages.enabled, true)
      ))
      .limit(1);

    if (rrMessage.length === 0) {
      return; // Not a reaction role message
    }

    const config = rrMessage[0];

    // Check if user has permission (whitelist/blacklist)
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return reaction.users.remove(user.id).catch(() => null);
    }

    // Check whitelist (if exists, user must have one of the whitelisted roles)
    const whitelist = await db.select()
      .from(reactionRoleWhitelist)
      .where(eq(reactionRoleWhitelist.messageConfigId, config.id));

    if (whitelist.length > 0) {
      const whitelistedRoleIds = whitelist.map(w => w.roleId);
      const hasWhitelistedRole = member.roles.cache.some(r => whitelistedRoleIds.includes(r.id));
      
      if (!hasWhitelistedRole) {
        await reaction.users.remove(user.id).catch(() => null);
        
        try {
          await member.send('❌ You don\'t have permission to use this reaction role.');
        } catch (dmError) {
          // DMs disabled
        }
        return;
      }
    }

    // Check blacklist (if user has any blacklisted role, deny access)
    const blacklist = await db.select()
      .from(reactionRoleBlacklist)
      .where(eq(reactionRoleBlacklist.messageConfigId, config.id));

    if (blacklist.length > 0) {
      const blacklistedRoleIds = blacklist.map(b => b.roleId);
      const hasBlacklistedRole = member.roles.cache.some(r => blacklistedRoleIds.includes(r.id));
      
      if (hasBlacklistedRole) {
        await reaction.users.remove(user.id).catch(() => null);
        
        try {
          await member.send('❌ Your role prevents you from using this reaction role.');
        } catch (dmError) {
          // DMs disabled
        }
        return;
      }
    }

    // Get the emoji-role option
    const option = await db.select()
      .from(reactionRoleOptions)
      .where(and(
        eq(reactionRoleOptions.messageConfigId, config.id),
        eq(reactionRoleOptions.emoji, emoji)
      ))
      .limit(1);

    if (option.length === 0) {
      // Unknown emoji, remove reaction
      return reaction.users.remove(user.id).catch(() => null);
    }

    const roleOption = option[0];

    // Get the role (moved up before max check for better flow)
    const role = await message.guild.roles.fetch(roleOption.roleId).catch(() => null);
    if (!role) {
      return reaction.users.remove(user.id).catch(() => null);
    }

    // Check if member already has role (remove reaction if they do)
    if (member.roles.cache.has(role.id)) {
      await reaction.users.remove(user.id).catch(() => null);
      
      try {
        await member.send(`ℹ️ You already have the **${role.name}** role.`);
      } catch (dmError) {
        // DMs disabled
      }
      return;
    }

    // Check role hierarchy
    const botMember = await message.guild.members.fetchMe();
    if (role.position >= botMember.roles.highest.position) {
      await reaction.users.remove(user.id).catch(() => null);
      console.error(`⚠️ Cannot assign role ${role.name} - bot's highest role is lower in hierarchy`);
      return;
    }

    // Max roles per user will be checked atomically during assignment insert (see below)

    // Check group constraints (unique, limit)
    const groups = await db.select()
      .from(reactionRoleGroups)
      .where(eq(reactionRoleGroups.messageConfigId, config.id));

    for (const group of groups) {
      const emojiIds = JSON.parse(group.emojiIds || '[]');
      
      if (!emojiIds.includes(roleOption.id)) continue; // This emoji not in group

      // Fetch all options in this group (needed for both unique and limit)
      const otherOptionsInGroup = await db.select()
        .from(reactionRoleOptions)
        .where(and(
          eq(reactionRoleOptions.messageConfigId, config.id),
          inArray(reactionRoleOptions.id, emojiIds)
        ));

      if (group.groupType === 'unique') {
        // Remove other roles in this group
        for (const otherOption of otherOptionsInGroup) {
          if (otherOption.id === roleOption.id) continue;
          
          const otherRole = await message.guild.roles.fetch(otherOption.roleId).catch(() => null);
          if (otherRole && member.roles.cache.has(otherRole.id)) {
            // Remove role from member
            await member.roles.remove(otherRole);
            
            // CRITICAL: Remove assignment record and check if it existed
            const deletedAssignment = await db.delete(reactionRoleAssignments)
              .where(and(
                eq(reactionRoleAssignments.serverId, message.guild.id),
                eq(reactionRoleAssignments.userId, user.id),
                eq(reactionRoleAssignments.optionId, otherOption.id)
              ))
              .returning();
            
            // CRITICAL: Only decrement if assignment record existed
            if (deletedAssignment.length > 0) {
              await db.update(reactionRoleOptions)
                .set({ 
                  currentAssignments: sql`GREATEST(COALESCE(${reactionRoleOptions.currentAssignments}, 0) - 1, 0)`
                })
                .where(eq(reactionRoleOptions.id, otherOption.id));
            }
            
            console.log(`🔄 Removed ${otherRole.name} from ${member.user.tag} (unique group)`);
          }
        }
      } else if (group.groupType === 'limit') {
        // Store for later atomic check during assignment
        // We'll check this in SQL when inserting the assignment record
      }
    }

    // CRITICAL: Explicit database transaction with row-level locking
    // This ensures atomicity under high concurrent load
    const expiresAt = roleOption.tempDurationMinutes 
      ? new Date(Date.now() + roleOption.tempDurationMinutes * 60 * 1000)
      : null;

    let assignmentId = null;
    let limitViolation = null;

    try {
      // Build limit-group data
      let limitGroupRoleIds = [];
      let limitGroupMaxRoles = null;
      let limitGroupName = '';
      
      for (const group of groups) {
        const emojiIds = JSON.parse(group.emojiIds || '[]');
        if (!emojiIds.includes(roleOption.id)) continue;
        
        if (group.groupType === 'limit') {
          const groupOptions = await db.select()
            .from(reactionRoleOptions)
            .where(and(
              eq(reactionRoleOptions.messageConfigId, config.id),
              inArray(reactionRoleOptions.id, emojiIds)
            ));
          
          limitGroupRoleIds = groupOptions.map(o => o.roleId);
          limitGroupMaxRoles = group.maxRoles;
          limitGroupName = group.groupName;
          break;
        }
      }

      // CRITICAL: Use explicit transaction with SELECT FOR UPDATE
      const result = await db.transaction(async (tx) => {
        // CRITICAL: Lock parent message config row FIRST
        // This ensures serialization even when user has 0 assignments
        await tx.execute(sql`
          SELECT id
          FROM reaction_role_messages
          WHERE id = ${config.id}
          FOR UPDATE
        `);

        // Lock the option row for update
        const lockedOption = await tx.execute(sql`
          SELECT id, current_assignments, max_assignments
          FROM reaction_role_options
          WHERE id = ${roleOption.id}
          FOR UPDATE
        `);

        const optionData = lockedOption.rows[0];
        const currentAssignments = parseInt(optionData?.current_assignments || '0');
        const maxAssignments = optionData?.max_assignments;

        // Check maxAssignments with locked row
        if (maxAssignments && currentAssignments >= maxAssignments) {
          return { violation: 'max_assignments' };
        }

        // Lock user's current assignments for this message (without COUNT)
        // Note: If empty, parent lock ensures serialization
        if (config.maxRolesPerUser) {
          const userAssignments = await tx.execute(sql`
            SELECT id
            FROM reaction_role_assignments
            WHERE server_id = ${message.guild.id}
              AND user_id = ${user.id}
              AND message_config_id = ${config.id}
            FOR UPDATE
          `);

          const count = userAssignments.rows.length;
          if (count >= config.maxRolesPerUser) {
            return { violation: 'max_roles_per_user', maxRolesPerUser: config.maxRolesPerUser };
          }
        }

        // Lock user's roles in limit group (without COUNT)
        // Note: If empty, parent lock ensures serialization
        if (limitGroupMaxRoles && limitGroupRoleIds.length > 0) {
          const groupAssignments = await tx.execute(sql`
            SELECT id
            FROM reaction_role_assignments
            WHERE server_id = ${message.guild.id}
              AND user_id = ${user.id}
              AND message_config_id = ${config.id}
              AND role_id = ANY(ARRAY[${sql.join(limitGroupRoleIds.map(id => sql`${id}`), sql`, `)}])
            FOR UPDATE
          `);

          const count = groupAssignments.rows.length;
          if (count >= limitGroupMaxRoles) {
            return { 
              violation: 'limit_group', 
              maxRoles: limitGroupMaxRoles,
              groupName: limitGroupName
            };
          }
        }

        // All checks passed - increment counter
        await tx.update(reactionRoleOptions)
          .set({ currentAssignments: sql`COALESCE(${reactionRoleOptions.currentAssignments}, 0) + 1` })
          .where(eq(reactionRoleOptions.id, roleOption.id));

        // Insert assignment
        const inserted = await tx.insert(reactionRoleAssignments)
          .values({
            serverId: message.guild.id,
            userId: user.id,
            messageConfigId: config.id,
            optionId: roleOption.id,
            roleId: role.id,
            expiresAt: expiresAt
          })
          .returning({ id: reactionRoleAssignments.id });

        return { assignmentId: inserted[0].id };
      });

      // Check transaction result
      if (result.violation) {
        await reaction.users.remove(user.id).catch(() => null);
        
        const errorMessages = {
          'max_assignments': 'This role has reached its maximum number of assignments.',
          'max_roles_per_user': `You've reached the maximum of ${result.maxRolesPerUser} role(s) from this message.`,
          'limit_group': `You've reached the limit of ${result.maxRoles} role(s) in the "${result.groupName}" group.`
        };
        
        try {
          await member.send(`❌ ${errorMessages[result.violation] || 'Role assignment limit reached.'}`);
        } catch (dmError) {
          // DMs disabled
        }
        return;
      }

      assignmentId = result.assignmentId;

    } catch (txError) {
      console.error('Transaction error:', txError);
      await reaction.users.remove(user.id).catch(() => null);
      return;
    }

    // Transaction committed successfully, now assign Discord role
    try {
      await member.roles.add(role);
    } catch (roleError) {
      // Discord role assignment failed, compensating rollback
      console.error('Failed to assign role, rolling back:', roleError);
      
      await db.delete(reactionRoleAssignments)
        .where(eq(reactionRoleAssignments.id, assignmentId));
      
      await db.update(reactionRoleOptions)
        .set({ 
          currentAssignments: sql`GREATEST(COALESCE(${reactionRoleOptions.currentAssignments}, 0) - 1, 0)`
        })
        .where(eq(reactionRoleOptions.id, roleOption.id));
      
      await reaction.users.remove(user.id).catch(() => null);
      return;
    }

    // Log action
    await db.insert(roleAuditLogs).values({
      serverId: message.guild.id,
      userId: user.id,
      action: 'rr_assign_role',
      module: 'reaction_roles',
      details: {
        roleId: role.id,
        roleName: role.name,
        messageId: message.id,
        emoji: emoji,
        temporary: !!expiresAt,
        expiresAt: expiresAt?.toISOString()
      },
      performedBy: user.id
    }).catch(err => console.error('Failed to log RR assign:', err));

    console.log(`🎭 Assigned role ${role.name} to ${member.user.tag} via reaction`);

    // Send DM notification (if not self-destruct mode)
    if (!config.selfDestruct) {
      try {
        const dmEmbed = {
          color: 0x10b981,
          title: '✅ Role Assigned',
          description: `You've been given the **${role.name}** role in **${message.guild.name}**!`,
          timestamp: new Date().toISOString()
        };

        if (expiresAt) {
          dmEmbed.fields = [
            { name: 'Expires', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true }
          ];
        }

        await member.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        // DMs disabled
      }
    }

    // Self-destruct mode: remove reaction after assignment
    if (config.selfDestruct) {
      await reaction.users.remove(user.id).catch(() => null);
    }
  } catch (error) {
    console.error('Error handling reaction add:', error);
  }
}

/**
 * Handle reaction remove event
 */
async function handleReactionRemove(reaction, user) {
  // Ignore bot reactions
  if (user.bot) return;

  try {
    // Fetch partial message if needed
    if (reaction.partial) {
      await reaction.fetch();
    }

    const { message } = reaction;
    const emoji = reaction.emoji.toString();

    // Check if this is a reaction role message
    const rrMessage = await db.select()
      .from(reactionRoleMessages)
      .where(and(
        eq(reactionRoleMessages.serverId, message.guild.id),
        eq(reactionRoleMessages.messageId, message.id),
        eq(reactionRoleMessages.enabled, true)
      ))
      .limit(1);

    if (rrMessage.length === 0) {
      return; // Not a reaction role message
    }

    const config = rrMessage[0];

    // Get the emoji-role option
    const option = await db.select()
      .from(reactionRoleOptions)
      .where(and(
        eq(reactionRoleOptions.messageConfigId, config.id),
        eq(reactionRoleOptions.emoji, emoji)
      ))
      .limit(1);

    if (option.length === 0) {
      return; // Unknown emoji
    }

    const roleOption = option[0];

    // Get member
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    // Get the role
    const role = await message.guild.roles.fetch(roleOption.roleId).catch(() => null);
    if (!role) return;

    // Check if member has role
    if (!member.roles.cache.has(role.id)) {
      return; // Member doesn't have role
    }

    // Remove role
    await member.roles.remove(role);

    // Remove from assignments tracking and check if it existed
    const deletedAssignment = await db.delete(reactionRoleAssignments)
      .where(and(
        eq(reactionRoleAssignments.serverId, message.guild.id),
        eq(reactionRoleAssignments.userId, user.id),
        eq(reactionRoleAssignments.optionId, roleOption.id)
      ))
      .returning();

    // Update current assignments count atomically (only if assignment existed)
    if (deletedAssignment.length > 0) {
      await db.update(reactionRoleOptions)
        .set({ 
          currentAssignments: sql`GREATEST(COALESCE(${reactionRoleOptions.currentAssignments}, 0) - 1, 0)`
        })
        .where(eq(reactionRoleOptions.id, roleOption.id));
    }

    // Log action
    await db.insert(roleAuditLogs).values({
      serverId: message.guild.id,
      userId: user.id,
      action: 'rr_remove_role',
      module: 'reaction_roles',
      details: {
        roleId: role.id,
        roleName: role.name,
        messageId: message.id,
        emoji: emoji
      },
      performedBy: user.id
    }).catch(err => console.error('Failed to log RR remove:', err));

    console.log(`🎭 Removed role ${role.name} from ${member.user.tag} via reaction`);

    // Send DM notification
    try {
      await member.send({
        embeds: [{
          color: 0xef4444,
          title: '❌ Role Removed',
          description: `The **${role.name}** role has been removed from you in **${message.guild.name}**.`,
          timestamp: new Date().toISOString()
        }]
      });
    } catch (dmError) {
      // DMs disabled
    }
  } catch (error) {
    console.error('Error handling reaction remove:', error);
  }
}

module.exports = {
  handleReactionAdd,
  handleReactionRemove
};
