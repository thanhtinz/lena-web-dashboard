const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'temprole',
  description: 'Manage temporary roles that auto-expire',
  aliases: ['tr', 'temporaryrole'],
  permissions: [PermissionFlagsBits.ManageRoles],
  
  async execute(message, args, client, db) {
    const { tempRoles, roleAuditLogs } = require('../database/schema');
    const { eq, and } = require('drizzle-orm');

    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn cần quyền **Manage Roles** để sử dụng lệnh này!');
    }

    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('⏰ Temporary Roles Commands')
          .setDescription('Assign roles that automatically expire after a duration')
          .addFields(
            { 
              name: '📝 Add Temporary Role', 
              value: '`!temprole add <user> <role> <duration> [reason]`\nExamples: `1h`, `2d`, `1w`, `30m`' 
            },
            { 
              name: '🗑️ Remove Temporary Role', 
              value: '`!temprole remove <user> <role>`\nRemove a temporary role early' 
            },
            { 
              name: '📋 List Temporary Roles', 
              value: '`!temprole list [user]`\nView all active temporary roles (or for a specific user)' 
            },
            { 
              name: '🧹 Clear Temporary Roles', 
              value: '`!temprole clear <user>`\nRemove all temporary roles from a user' 
            }
          )
          .setFooter({ text: 'Duration formats: 1m = 1 minute, 1h = 1 hour, 1d = 1 day, 1w = 1 week' })
        ]
      });
    }

    // ADD TIMED ROLE
    if (subcommand === 'add') {
      const targetUser = message.mentions.members.first() || 
                        await message.guild.members.fetch(args[1]).catch(() => null);
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[2]).catch(() => null);
      const duration = args[3];
      const reason = args.slice(4).join(' ') || 'No reason provided';

      if (!targetUser) {
        return message.reply('❌ User not found. Mention a user or provide their ID.');
      }

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      if (!duration) {
        return message.reply('❌ Please provide a duration (e.g., `1h`, `2d`, `1w`).');
      }

      // Parse duration
      const parsedDuration = parseDuration(duration);
      if (!parsedDuration) {
        return message.reply('❌ Invalid duration format. Use: `1m`, `1h`, `2d`, `1w`, etc.');
      }

      // Permission checks
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply('❌ I need the **Manage Roles** permission to do this.');
      }

      if (roleMention.position >= message.guild.members.me.roles.highest.position) {
        return message.reply('❌ I cannot manage this role because it is higher than or equal to my highest role.');
      }

      if (roleMention.position >= message.member.roles.highest.position) {
        return message.reply('❌ You cannot assign this role because it is higher than or equal to your highest role.');
      }

      try {
        const expiresAt = new Date(Date.now() + parsedDuration);

        // Add role to user
        await targetUser.roles.add(roleMention);

        // Add to database
        await db.insert(tempRoles).values({
          serverId: message.guild.id,
          userId: targetUser.id,
          roleId: roleMention.id,
          expiresAt: expiresAt,
          addedBy: message.author.id,
          reason: reason
        });

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: targetUser.id,
          action: 'temp_role_add',
          module: 'temp_roles',
          details: {
            roleId: roleMention.id,
            duration: duration,
            expiresAt: expiresAt.toISOString(),
            reason: reason
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role add:', err));

        const embed = new EmbedBuilder()
          .setColor('#10b981')
          .setTitle('⏰ Temporary Role Added')
          .setDescription(`${targetUser} will have ${roleMention} removed <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`)
          .addFields(
            { name: 'User', value: `${targetUser.user.tag}`, inline: true },
            { name: 'Role', value: `${roleMention.name}`, inline: true },
            { name: 'Duration', value: duration, inline: true },
            { name: 'Expires', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>`, inline: false },
            { name: 'Reason', value: reason, inline: false }
          )
          .setFooter({ text: `Added by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
        console.log(`⏰ Added temporary role ${roleMention.name} to ${targetUser.user.tag} (expires: ${expiresAt})`);
      } catch (error) {
        console.error('Failed to add temporary role:', error);
        message.reply('❌ Failed to add temporary role. Please check my permissions and try again.');
      }
    }

    // REMOVE TIMED ROLE
    else if (subcommand === 'remove') {
      const targetUser = message.mentions.members.first() || 
                        await message.guild.members.fetch(args[1]).catch(() => null);
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[2]).catch(() => null);

      if (!targetUser) {
        return message.reply('❌ User not found. Mention a user or provide their ID.');
      }

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      try {
        // Remove from database
        const deleted = await db.delete(tempRoles)
          .where(and(
            eq(tempRoles.serverId, message.guild.id),
            eq(tempRoles.userId, targetUser.id),
            eq(tempRoles.roleId, roleMention.id)
          ))
          .returning();

        if (deleted.length === 0) {
          return message.reply('❌ No temporary role found for this user and role.');
        }

        // Remove role from user
        await targetUser.roles.remove(roleMention).catch(() => null);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: targetUser.id,
          action: 'temp_role_remove',
          module: 'temp_roles',
          details: {
            roleId: roleMention.id,
            removedEarly: true
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role remove:', err));

        const embed = new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('⏰ Temporary Role Removed')
          .setDescription(`Removed ${roleMention} from ${targetUser}`)
          .setFooter({ text: `Removed by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to remove temporary role:', error);
        message.reply('❌ Failed to remove temporary role. Please try again.');
      }
    }

    // LIST TIMED ROLES
    else if (subcommand === 'list') {
      const targetUser = message.mentions.members.first() || 
                        (args[1] ? await message.guild.members.fetch(args[1]).catch(() => null) : null);

      try {
        let query = db.select().from(tempRoles);
        
        if (targetUser) {
          query = query.where(and(
            eq(tempRoles.serverId, message.guild.id),
            eq(tempRoles.userId, targetUser.id)
          ));
        } else {
          query = query.where(eq(tempRoles.serverId, message.guild.id));
        }

        const roles = await query;

        if (roles.length === 0) {
          return message.reply('📋 No active temporary roles found.');
        }

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(`⏰ Active Temporary Roles ${targetUser ? `for ${targetUser.user.tag}` : ''}`)
          .setDescription(`Total: **${roles.length}** temporary role(s)`)
          .setTimestamp();

        for (const tempRole of roles.slice(0, 10)) {
          const user = await client.users.fetch(tempRole.userId).catch(() => null);
          const role = await message.guild.roles.fetch(tempRole.roleId).catch(() => null);
          
          embed.addFields({
            name: `${user?.tag || 'Unknown User'} - ${role?.name || 'Unknown Role'}`,
            value: `Expires: <t:${Math.floor(tempRole.expiresAt.getTime() / 1000)}:R>\nReason: ${tempRole.reason || 'No reason'}`,
            inline: false
          });
        }

        if (roles.length > 10) {
          embed.setFooter({ text: `Showing 10 of ${roles.length} temporary roles` });
        }

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to list temporary roles:', error);
        message.reply('❌ Failed to fetch temporary roles. Please try again.');
      }
    }

    // CLEAR TIMED ROLES
    else if (subcommand === 'clear') {
      const targetUser = message.mentions.members.first() || 
                        await message.guild.members.fetch(args[1]).catch(() => null);

      if (!targetUser) {
        return message.reply('❌ User not found. Mention a user or provide their ID.');
      }

      try {
        // Get all temporary roles for user
        const userTempRoles = await db.select()
          .from(tempRoles)
          .where(and(
            eq(tempRoles.serverId, message.guild.id),
            eq(tempRoles.userId, targetUser.id)
          ));

        if (userTempRoles.length === 0) {
          return message.reply('❌ No temporary roles found for this user.');
        }

        // Remove all roles
        for (const tr of userTempRoles) {
          const role = await message.guild.roles.fetch(tr.roleId).catch(() => null);
          if (role) {
            await targetUser.roles.remove(role).catch(() => null);
          }
        }

        // Delete from database
        await db.delete(tempRoles)
          .where(and(
            eq(tempRoles.serverId, message.guild.id),
            eq(tempRoles.userId, targetUser.id)
          ));

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: targetUser.id,
          action: 'temp_role_clear',
          module: 'temp_roles',
          details: {
            rolesCleared: userTempRoles.length,
            roleIds: userTempRoles.map(r => r.roleId)
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role clear:', err));

        const embed = new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('🧹 Temporary Roles Cleared')
          .setDescription(`Removed **${userTempRoles.length}** temporary role(s) from ${targetUser}`)
          .setFooter({ text: `Cleared by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to clear temporary roles:', error);
        message.reply('❌ Failed to clear temporary roles. Please try again.');
      }
    }

    else {
      message.reply('❌ Invalid subcommand. Use: `add`, `remove`, `list`, or `clear`');
    }
  }
};

function parseDuration(duration) {
  const regex = /^(\d+)([mhdw])$/i;
  const match = duration.match(regex);
  
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    'm': 60 * 1000,           // minutes
    'h': 60 * 60 * 1000,      // hours
    'd': 24 * 60 * 60 * 1000, // days
    'w': 7 * 24 * 60 * 60 * 1000 // weeks
  };
  
  return value * multipliers[unit];
}
