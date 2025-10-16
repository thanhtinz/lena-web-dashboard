const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'timedrole',
  description: 'Manage delayed role assignment (assign roles after X minutes when members join)',
  aliases: ['trole', 'delayedrole'],
  permissions: [PermissionFlagsBits.ManageRoles],
  
  async execute(message, args, client, db) {
    const { timedRoles, roleAuditLogs } = require('../database/schema');
    const { eq, and } = require('drizzle-orm');

    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn cần quyền **Manage Roles** để sử dụng lệnh này!');
    }

    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('⏰ Timed Roles Commands')
          .setDescription('Automatically assign roles to members after a delay when they join')
          .addFields(
            { 
              name: '➕ Add Timed Role', 
              value: '`!timedrole add <role> <delay>`\nExamples: `5m`, `1h`, `30m`' 
            },
            { 
              name: '🗑️ Remove Timed Role', 
              value: '`!timedrole remove <role>`\nRemove a role from timed assignments' 
            },
            { 
              name: '📋 List Timed Roles', 
              value: '`!timedrole list`\nView all configured timed roles' 
            },
            { 
              name: '🔄 Enable/Disable', 
              value: '`!timedrole enable/disable <role>`\nToggle a timed role on/off' 
            }
          )
          .setFooter({ text: 'Delay formats: 5m = 5 minutes, 1h = 1 hour, 2h = 2 hours' })
        ]
      });
    }

    // ADD TIMED ROLE
    if (subcommand === 'add') {
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[1]).catch(() => null);
      const delayInput = args[2];

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      if (!delayInput) {
        return message.reply('❌ Please provide a delay (e.g., `5m`, `1h`, `30m`).');
      }

      // Parse delay
      const delayMinutes = parseDelay(delayInput);
      if (!delayMinutes) {
        return message.reply('❌ Invalid delay format. Use formats like: `5m`, `1h`, `2h`');
      }

      try {
        // Check if already exists
        const existing = await db.select()
          .from(timedRoles)
          .where(and(
            eq(timedRoles.serverId, message.guild.id),
            eq(timedRoles.roleId, roleMention.id)
          ))
          .limit(1);

        if (existing.length > 0) {
          return message.reply(`❌ ${roleMention} is already configured as a timed role. Use \`!timedrole remove\` first.`);
        }

        // Add to database
        await db.insert(timedRoles).values({
          serverId: message.guild.id,
          roleId: roleMention.id,
          delayMinutes: delayMinutes,
          enabled: true,
          createdBy: message.author.id
        });

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'timed_role_add',
          module: 'timed_roles',
          details: {
            roleId: roleMention.id,
            roleName: roleMention.name,
            delayMinutes: delayMinutes
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role add:', err));

        const embed = new EmbedBuilder()
          .setColor('#10b981')
          .setTitle('⏰ Timed Role Added')
          .setDescription(`${roleMention} will be assigned to new members after **${delayInput}**`)
          .addFields(
            { name: 'Role', value: roleMention.name, inline: true },
            { name: 'Delay', value: `${delayMinutes} minutes`, inline: true }
          )
          .setFooter({ text: `Added by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
        console.log(`⏰ Added timed role ${roleMention.name} with ${delayMinutes}m delay`);
      } catch (error) {
        console.error('Failed to add timed role:', error);
        message.reply('❌ Failed to add timed role. Please try again.');
      }
    }

    // REMOVE TIMED ROLE
    else if (subcommand === 'remove') {
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[1]).catch(() => null);

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      try {
        const deleted = await db.delete(timedRoles)
          .where(and(
            eq(timedRoles.serverId, message.guild.id),
            eq(timedRoles.roleId, roleMention.id)
          ))
          .returning();

        if (deleted.length === 0) {
          return message.reply('❌ No timed role configuration found for this role.');
        }

        // CRITICAL: Also remove all pending queue entries for this role
        const { timedRoleQueue } = require('../database/schema');
        const clearedQueue = await db.delete(timedRoleQueue)
          .where(and(
            eq(timedRoleQueue.serverId, message.guild.id),
            eq(timedRoleQueue.roleId, roleMention.id),
            eq(timedRoleQueue.status, 'pending')
          ))
          .returning();

        console.log(`🧹 Cleared ${clearedQueue.length} pending queue entries for ${roleMention.name}`);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'timed_role_remove',
          module: 'timed_roles',
          details: {
            roleId: roleMention.id,
            roleName: roleMention.name,
            delayMinutes: deleted[0].delayMinutes,
            queueEntriesCleared: clearedQueue.length
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role remove:', err));

        const embed = new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('⏰ Timed Role Removed')
          .setDescription(`Removed ${roleMention} from timed role assignments`)
          .addFields(
            { name: 'Queue Entries Cleared', value: `${clearedQueue.length} pending assignments cancelled`, inline: true }
          )
          .setFooter({ text: `Removed by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to remove timed role:', error);
        message.reply('❌ Failed to remove timed role. Please try again.');
      }
    }

    // LIST TIMED ROLES
    else if (subcommand === 'list') {
      try {
        const roles = await db.select()
          .from(timedRoles)
          .where(eq(timedRoles.serverId, message.guild.id));

        if (roles.length === 0) {
          return message.reply('📋 No timed roles configured.');
        }

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(`⏰ Timed Roles Configuration`)
          .setDescription(`Total: **${roles.length}** timed role(s)`)
          .setTimestamp();

        for (const timedRole of roles.slice(0, 10)) {
          const role = await message.guild.roles.fetch(timedRole.roleId).catch(() => null);
          
          embed.addFields({
            name: `${role?.name || 'Unknown Role'} ${timedRole.enabled ? '✅' : '❌'}`,
            value: `Delay: **${timedRole.delayMinutes}** minutes\nStatus: ${timedRole.enabled ? 'Enabled' : 'Disabled'}`,
            inline: true
          });
        }

        if (roles.length > 10) {
          embed.setFooter({ text: `Showing 10 of ${roles.length} timed roles` });
        }

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to list timed roles:', error);
        message.reply('❌ Failed to fetch timed roles. Please try again.');
      }
    }

    // ENABLE TIMED ROLE
    else if (subcommand === 'enable') {
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[1]).catch(() => null);

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      try {
        const updated = await db.update(timedRoles)
          .set({ enabled: true })
          .where(and(
            eq(timedRoles.serverId, message.guild.id),
            eq(timedRoles.roleId, roleMention.id)
          ))
          .returning();

        if (updated.length === 0) {
          return message.reply('❌ No timed role configuration found for this role.');
        }

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'timed_role_enable',
          module: 'timed_roles',
          details: {
            roleId: roleMention.id,
            roleName: roleMention.name
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role enable:', err));

        message.reply(`✅ Enabled timed role assignment for ${roleMention}`);
      } catch (error) {
        console.error('Failed to enable timed role:', error);
        message.reply('❌ Failed to enable timed role. Please try again.');
      }
    }

    // DISABLE TIMED ROLE
    else if (subcommand === 'disable') {
      const roleMention = message.mentions.roles.first() || 
                         await message.guild.roles.fetch(args[1]).catch(() => null);

      if (!roleMention) {
        return message.reply('❌ Role not found. Mention a role or provide its ID.');
      }

      try {
        const updated = await db.update(timedRoles)
          .set({ enabled: false })
          .where(and(
            eq(timedRoles.serverId, message.guild.id),
            eq(timedRoles.roleId, roleMention.id)
          ))
          .returning();

        if (updated.length === 0) {
          return message.reply('❌ No timed role configuration found for this role.');
        }

        // CRITICAL: Also remove all pending queue entries for this role
        const { timedRoleQueue } = require('../database/schema');
        const clearedQueue = await db.delete(timedRoleQueue)
          .where(and(
            eq(timedRoleQueue.serverId, message.guild.id),
            eq(timedRoleQueue.roleId, roleMention.id),
            eq(timedRoleQueue.status, 'pending')
          ))
          .returning();

        console.log(`🧹 Cleared ${clearedQueue.length} pending queue entries for ${roleMention.name} (disabled)`);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'timed_role_disable',
          module: 'timed_roles',
          details: {
            roleId: roleMention.id,
            roleName: roleMention.name,
            queueEntriesCleared: clearedQueue.length
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log timed role disable:', err));

        const embed = new EmbedBuilder()
          .setColor('#fbbf24')
          .setTitle('⏰ Timed Role Disabled')
          .setDescription(`Disabled timed role assignment for ${roleMention}`)
          .addFields(
            { name: 'Queue Entries Cleared', value: `${clearedQueue.length} pending assignments cancelled`, inline: true }
          )
          .setFooter({ text: `Disabled by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to disable timed role:', error);
        message.reply('❌ Failed to disable timed role. Please try again.');
      }
    }

    else {
      message.reply('❌ Invalid subcommand. Use `!timedrole` to see available commands.');
    }
  }
};

// Parse delay string to minutes
function parseDelay(delayStr) {
  const match = delayStr.match(/^(\d+)([mh])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === 'm') {
    return value; // minutes
  } else if (unit === 'h') {
    return value * 60; // hours to minutes
  }

  return null;
}
