const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'rr',
  description: 'Reaction Roles - Assign roles via reactions',
  aliases: ['reactionrole', 'reactionroles'],
  permissions: [PermissionFlagsBits.ManageRoles],
  
  async execute(message, args, client, db) {
    const { 
      reactionRoleMessages, 
      reactionRoleOptions, 
      reactionRoleGroups,
      reactionRoleWhitelist,
      reactionRoleBlacklist,
      roleAuditLogs 
    } = require('../database/schema');
    const { eq, and } = require('drizzle-orm');

    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn cần quyền **Manage Roles** để sử dụng lệnh này!');
    }

    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('🎭 Reaction Roles Commands')
          .setDescription('Create interactive reaction role messages')
          .addFields(
            { 
              name: '✨ Create Message', 
              value: '`!rr create <#channel> <title> | <description>`\nCreate a new reaction role message' 
            },
            { 
              name: '➕ Add Reaction', 
              value: '`!rr addreact <messageID> <emoji> <@role>`\nAdd emoji-role pair to message' 
            },
            { 
              name: '➖ Remove Reaction', 
              value: '`!rr removereact <messageID> <emoji>`\nRemove emoji-role pair' 
            },
            { 
              name: '🗑️ Delete Message', 
              value: '`!rr delete <messageID>`\nDelete reaction role message' 
            },
            { 
              name: '✏️ Edit Message', 
              value: '`!rr edit <messageID> <title> | <description>`\nEdit message content' 
            },
            { 
              name: '🎨 Change Color', 
              value: '`!rr color <messageID> <hex>`\nChange embed color (e.g., #3b82f6)' 
            }
          )
          .setFooter({ text: 'More commands: !rr help' })
        ]
      });
    }

    // CREATE REACTION ROLE MESSAGE
    if (subcommand === 'create') {
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('❌ Please mention a channel. Usage: `!rr create #channel Title | Description`');
      }

      // Parse title and description
      const content = args.slice(1).join(' ');
      const parts = content.split('|').map(p => p.trim());
      
      if (parts.length < 2) {
        return message.reply('❌ Invalid format. Use: `!rr create #channel Title | Description`');
      }

      const [title, description] = parts;

      if (!title || !description) {
        return message.reply('❌ Both title and description are required.');
      }

      try {
        // Create embed
        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle(title)
          .setDescription(description)
          .setFooter({ text: 'React to assign yourself a role!' })
          .setTimestamp();

        // Send message to channel
        const sentMessage = await channel.send({ embeds: [embed] });

        // Save to database
        await db.insert(reactionRoleMessages).values({
          serverId: message.guild.id,
          channelId: channel.id,
          messageId: sentMessage.id,
          messageType: 'normal',
          enabled: true,
          createdBy: message.author.id
        });

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_create',
          module: 'reaction_roles',
          details: {
            messageId: sentMessage.id,
            channelId: channel.id,
            title,
            description
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR create:', err));

        message.reply(`✅ Reaction role message created in ${channel}!\nMessage ID: \`${sentMessage.id}\`\n\nNow add reactions with: \`!rr addreact ${sentMessage.id} <emoji> <@role>\``);
        console.log(`🎭 Created reaction role message ${sentMessage.id} in ${channel.name}`);
      } catch (error) {
        console.error('Failed to create reaction role message:', error);
        message.reply('❌ Failed to create reaction role message. Check my permissions.');
      }
    }

    // ADD REACTION
    else if (subcommand === 'addreact' || subcommand === 'add') {
      const messageId = args[1];
      const emoji = args[2];
      const role = message.mentions.roles.first() || 
                   await message.guild.roles.fetch(args[3]).catch(() => null);

      if (!messageId || !emoji || !role) {
        return message.reply('❌ Usage: `!rr addreact <messageID> <emoji> <@role>`');
      }

      try {
        // Check if message exists in database
        const rrMessage = await db.select()
          .from(reactionRoleMessages)
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .limit(1);

        if (rrMessage.length === 0) {
          return message.reply('❌ Reaction role message not found. Create one first with `!rr create`');
        }

        const config = rrMessage[0];

        // Fetch the actual Discord message
        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        if (!channel) {
          return message.reply('❌ Channel not found.');
        }

        const discordMessage = await channel.messages.fetch(messageId).catch(() => null);
        if (!discordMessage) {
          return message.reply('❌ Message not found in channel.');
        }

        // Check if emoji-role pair already exists
        const existing = await db.select()
          .from(reactionRoleOptions)
          .where(and(
            eq(reactionRoleOptions.messageConfigId, config.id),
            eq(reactionRoleOptions.emoji, emoji)
          ))
          .limit(1);

        if (existing.length > 0) {
          return message.reply(`❌ Emoji ${emoji} is already assigned to a role.`);
        }

        // Add reaction to message
        try {
          await discordMessage.react(emoji);
        } catch (reactError) {
          return message.reply('❌ Failed to react with that emoji. It may be invalid or I don\'t have access to it.');
        }

        // Add to database
        await db.insert(reactionRoleOptions).values({
          messageConfigId: config.id,
          serverId: message.guild.id,
          emoji: emoji,
          roleId: role.id,
          currentAssignments: 0
        });

        // Update embed to show new role
        await updateReactionRoleEmbed(discordMessage, config.id, db, client);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_add_option',
          module: 'reaction_roles',
          details: {
            messageId: messageId,
            emoji: emoji,
            roleId: role.id,
            roleName: role.name
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR add:', err));

        message.reply(`✅ Added ${emoji} → ${role} to the reaction role message!`);
        console.log(`🎭 Added reaction ${emoji} → ${role.name} to message ${messageId}`);
      } catch (error) {
        console.error('Failed to add reaction:', error);
        message.reply('❌ Failed to add reaction. Please try again.');
      }
    }

    // REMOVE REACTION
    else if (subcommand === 'removereact' || subcommand === 'remove') {
      const messageId = args[1];
      const emoji = args[2];

      if (!messageId || !emoji) {
        return message.reply('❌ Usage: `!rr removereact <messageID> <emoji>`');
      }

      try {
        // Get message config
        const rrMessage = await db.select()
          .from(reactionRoleMessages)
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .limit(1);

        if (rrMessage.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        const config = rrMessage[0];

        // Delete from database
        const deleted = await db.delete(reactionRoleOptions)
          .where(and(
            eq(reactionRoleOptions.messageConfigId, config.id),
            eq(reactionRoleOptions.emoji, emoji)
          ))
          .returning();

        if (deleted.length === 0) {
          return message.reply(`❌ Emoji ${emoji} not found on this reaction role message.`);
        }

        // Remove reaction from Discord message
        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        const discordMessage = await channel?.messages.fetch(messageId).catch(() => null);
        
        if (discordMessage) {
          await discordMessage.reactions.cache.get(emoji)?.remove().catch(() => null);
          
          // Update embed
          await updateReactionRoleEmbed(discordMessage, config.id, db, client);
        }

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_remove_option',
          module: 'reaction_roles',
          details: {
            messageId: messageId,
            emoji: emoji,
            roleId: deleted[0].roleId
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR remove:', err));

        message.reply(`✅ Removed ${emoji} from the reaction role message!`);
        console.log(`🎭 Removed reaction ${emoji} from message ${messageId}`);
      } catch (error) {
        console.error('Failed to remove reaction:', error);
        message.reply('❌ Failed to remove reaction. Please try again.');
      }
    }

    // DELETE REACTION ROLE MESSAGE
    else if (subcommand === 'delete') {
      const messageId = args[1];

      if (!messageId) {
        return message.reply('❌ Usage: `!rr delete <messageID>`');
      }

      try {
        // Get message config
        const rrMessage = await db.select()
          .from(reactionRoleMessages)
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .limit(1);

        if (rrMessage.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        const config = rrMessage[0];

        // Delete all related data
        await db.delete(reactionRoleOptions)
          .where(eq(reactionRoleOptions.messageConfigId, config.id));
        
        await db.delete(reactionRoleGroups)
          .where(eq(reactionRoleGroups.messageConfigId, config.id));
        
        await db.delete(reactionRoleWhitelist)
          .where(eq(reactionRoleWhitelist.messageConfigId, config.id));
        
        await db.delete(reactionRoleBlacklist)
          .where(eq(reactionRoleBlacklist.messageConfigId, config.id));

        await db.delete(reactionRoleMessages)
          .where(eq(reactionRoleMessages.id, config.id));

        // Delete Discord message
        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        const discordMessage = await channel?.messages.fetch(messageId).catch(() => null);
        await discordMessage?.delete().catch(() => null);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_delete',
          module: 'reaction_roles',
          details: {
            messageId: messageId,
            channelId: config.channelId
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR delete:', err));

        message.reply('✅ Reaction role message deleted!');
        console.log(`🎭 Deleted reaction role message ${messageId}`);
      } catch (error) {
        console.error('Failed to delete reaction role message:', error);
        message.reply('❌ Failed to delete message. Please try again.');
      }
    }

    // EDIT REACTION ROLE MESSAGE
    else if (subcommand === 'edit') {
      const messageId = args[1];
      const content = args.slice(2).join(' ');
      const parts = content.split('|').map(p => p.trim());

      if (!messageId || parts.length < 2) {
        return message.reply('❌ Usage: `!rr edit <messageID> New Title | New Description`');
      }

      const [title, description] = parts;

      try {
        // Get message config
        const rrMessage = await db.select()
          .from(reactionRoleMessages)
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .limit(1);

        if (rrMessage.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        const config = rrMessage[0];

        // Fetch Discord message
        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        if (!channel) {
          return message.reply('❌ Channel not found.');
        }

        const discordMessage = await channel.messages.fetch(messageId).catch(() => null);
        if (!discordMessage || !discordMessage.embeds[0]) {
          return message.reply('❌ Message not found or has no embed.');
        }

        // Update embed
        const oldEmbed = discordMessage.embeds[0];
        const newEmbed = EmbedBuilder.from(oldEmbed)
          .setTitle(title)
          .setDescription(description);

        await discordMessage.edit({ embeds: [newEmbed] });

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_edit',
          module: 'reaction_roles',
          details: {
            messageId: messageId,
            newTitle: title,
            newDescription: description
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR edit:', err));

        message.reply('✅ Reaction role message updated!');
        console.log(`🎭 Edited reaction role message ${messageId}`);
      } catch (error) {
        console.error('Failed to edit reaction role message:', error);
        message.reply('❌ Failed to edit message. Please try again.');
      }
    }

    // CHANGE COLOR
    else if (subcommand === 'color' || subcommand === 'colour') {
      const messageId = args[1];
      let colorInput = args[2];

      if (!messageId || !colorInput) {
        return message.reply('❌ Usage: `!rr color <messageID> <hex>` (e.g., #3b82f6 or 3b82f6)');
      }

      // Ensure hex format
      if (!colorInput.startsWith('#')) {
        colorInput = '#' + colorInput;
      }

      // Validate hex color
      if (!/^#[0-9A-F]{6}$/i.test(colorInput)) {
        return message.reply('❌ Invalid color. Use hex format like #3b82f6');
      }

      try {
        // Get message config
        const rrMessage = await db.select()
          .from(reactionRoleMessages)
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .limit(1);

        if (rrMessage.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        const config = rrMessage[0];

        // Fetch Discord message
        const channel = await client.channels.fetch(config.channelId).catch(() => null);
        const discordMessage = await channel?.messages.fetch(messageId).catch(() => null);

        if (!discordMessage || !discordMessage.embeds[0]) {
          return message.reply('❌ Message not found or has no embed.');
        }

        // Update embed color
        const oldEmbed = discordMessage.embeds[0];
        const newEmbed = EmbedBuilder.from(oldEmbed).setColor(colorInput);

        await discordMessage.edit({ embeds: [newEmbed] });

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: message.guild.id,
          userId: null,
          action: 'rr_color',
          module: 'reaction_roles',
          details: {
            messageId: messageId,
            newColor: colorInput
          },
          performedBy: message.author.id
        }).catch(err => console.error('Failed to log RR color:', err));

        message.reply(`✅ Changed reaction role message color to ${colorInput}!`);
      } catch (error) {
        console.error('Failed to change color:', error);
        message.reply('❌ Failed to change color. Please try again.');
      }
    }

    // LOCK MESSAGE (prevent role assignment)
    else if (subcommand === 'lock') {
      const messageId = args[1];

      if (!messageId) {
        return message.reply('❌ Usage: `!rr lock <messageID>`');
      }

      try {
        const updated = await db.update(reactionRoleMessages)
          .set({ enabled: false })
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .returning();

        if (updated.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        message.reply(`🔒 Locked reaction role message. Users can no longer assign roles from it.`);
        console.log(`🔒 Locked reaction role message ${messageId}`);
      } catch (error) {
        console.error('Failed to lock message:', error);
        message.reply('❌ Failed to lock message. Please try again.');
      }
    }

    // UNLOCK MESSAGE
    else if (subcommand === 'unlock') {
      const messageId = args[1];

      if (!messageId) {
        return message.reply('❌ Usage: `!rr unlock <messageID>`');
      }

      try {
        const updated = await db.update(reactionRoleMessages)
          .set({ enabled: true })
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .returning();

        if (updated.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        message.reply(`🔓 Unlocked reaction role message. Users can now assign roles from it.`);
        console.log(`🔓 Unlocked reaction role message ${messageId}`);
      } catch (error) {
        console.error('Failed to unlock message:', error);
        message.reply('❌ Failed to unlock message. Please try again.');
      }
    }

    // SET MAX ROLES PER USER
    else if (subcommand === 'maxroles' || subcommand === 'max') {
      const messageId = args[1];
      const maxRoles = parseInt(args[2]);

      if (!messageId || isNaN(maxRoles) || maxRoles < 0) {
        return message.reply('❌ Usage: `!rr maxroles <messageID> <number>`\nSet to 0 for unlimited.');
      }

      try {
        const updated = await db.update(reactionRoleMessages)
          .set({ maxRolesPerUser: maxRoles === 0 ? null : maxRoles })
          .where(and(
            eq(reactionRoleMessages.serverId, message.guild.id),
            eq(reactionRoleMessages.messageId, messageId)
          ))
          .returning();

        if (updated.length === 0) {
          return message.reply('❌ Reaction role message not found.');
        }

        if (maxRoles === 0) {
          message.reply(`✅ Removed max roles limit. Users can now get all roles from this message.`);
        } else {
          message.reply(`✅ Set max roles per user to **${maxRoles}** for this message.`);
        }
      } catch (error) {
        console.error('Failed to set max roles:', error);
        message.reply('❌ Failed to set max roles. Please try again.');
      }
    }

    // CREATE GROUP (for unique/limit constraints)
    else if (subcommand === 'group') {
      const action = args[1]?.toLowerCase();

      if (action === 'create') {
        const messageId = args[2];
        const groupType = args[3]?.toLowerCase(); // unique or limit
        const groupName = args.slice(4).join(' ');

        if (!messageId || !groupType || !groupName) {
          return message.reply('❌ Usage: `!rr group create <messageID> <unique|limit> <name>`');
        }

        if (!['unique', 'limit'].includes(groupType)) {
          return message.reply('❌ Group type must be `unique` or `limit`');
        }

        try {
          // Get message config
          const rrMessage = await db.select()
            .from(reactionRoleMessages)
            .where(and(
              eq(reactionRoleMessages.serverId, message.guild.id),
              eq(reactionRoleMessages.messageId, messageId)
            ))
            .limit(1);

          if (rrMessage.length === 0) {
            return message.reply('❌ Reaction role message not found.');
          }

          // Create group
          await db.insert(reactionRoleGroups).values({
            serverId: message.guild.id,
            messageConfigId: rrMessage[0].id,
            groupName: groupName,
            groupType: groupType,
            maxRoles: groupType === 'unique' ? 1 : 3,
            emojiIds: JSON.stringify([])
          });

          message.reply(`✅ Created ${groupType} group: **${groupName}**\nNow add emojis to this group with: \`!rr group add <messageID> "${groupName}" <emoji>\``);
        } catch (error) {
          console.error('Failed to create group:', error);
          message.reply('❌ Failed to create group. Please try again.');
        }
      } else if (action === 'add') {
        const messageId = args[2];
        const groupName = args[3];
        const emoji = args[4];

        if (!messageId || !groupName || !emoji) {
          return message.reply('❌ Usage: `!rr group add <messageID> <groupName> <emoji>`');
        }

        try {
          // Get message config
          const rrMessage = await db.select()
            .from(reactionRoleMessages)
            .where(and(
              eq(reactionRoleMessages.serverId, message.guild.id),
              eq(reactionRoleMessages.messageId, messageId)
            ))
            .limit(1);

          if (rrMessage.length === 0) {
            return message.reply('❌ Reaction role message not found.');
          }

          // Get the emoji option ID
          const option = await db.select()
            .from(reactionRoleOptions)
            .where(and(
              eq(reactionRoleOptions.messageConfigId, rrMessage[0].id),
              eq(reactionRoleOptions.emoji, emoji)
            ))
            .limit(1);

          if (option.length === 0) {
            return message.reply(`❌ Emoji ${emoji} not found on this message. Add it first with \`!rr addreact\``);
          }

          // Get group
          const group = await db.select()
            .from(reactionRoleGroups)
            .where(and(
              eq(reactionRoleGroups.messageConfigId, rrMessage[0].id),
              eq(reactionRoleGroups.groupName, groupName)
            ))
            .limit(1);

          if (group.length === 0) {
            return message.reply(`❌ Group "${groupName}" not found.`);
          }

          // Add emoji to group
          const currentIds = JSON.parse(group[0].emojiIds || '[]');
          if (!currentIds.includes(option[0].id)) {
            currentIds.push(option[0].id);
            
            await db.update(reactionRoleGroups)
              .set({ emojiIds: JSON.stringify(currentIds) })
              .where(eq(reactionRoleGroups.id, group[0].id));

            message.reply(`✅ Added ${emoji} to group **${groupName}**`);
          } else {
            message.reply(`⚠️ ${emoji} is already in group **${groupName}**`);
          }
        } catch (error) {
          console.error('Failed to add to group:', error);
          message.reply('❌ Failed to add to group. Please try again.');
        }
      } else if (action === 'list') {
        const messageId = args[2];

        if (!messageId) {
          return message.reply('❌ Usage: `!rr group list <messageID>`');
        }

        try {
          const rrMessage = await db.select()
            .from(reactionRoleMessages)
            .where(and(
              eq(reactionRoleMessages.serverId, message.guild.id),
              eq(reactionRoleMessages.messageId, messageId)
            ))
            .limit(1);

          if (rrMessage.length === 0) {
            return message.reply('❌ Reaction role message not found.');
          }

          const groups = await db.select()
            .from(reactionRoleGroups)
            .where(eq(reactionRoleGroups.messageConfigId, rrMessage[0].id));

          if (groups.length === 0) {
            return message.reply('📋 No groups configured for this message.');
          }

          const embed = new EmbedBuilder()
            .setColor('#3b82f6')
            .setTitle('🎭 Reaction Role Groups')
            .setTimestamp();

          for (const group of groups) {
            const emojiIds = JSON.parse(group.emojiIds || '[]');
            const options = await db.select()
              .from(reactionRoleOptions)
              .where(and(
                eq(reactionRoleOptions.messageConfigId, rrMessage[0].id),
                eq(reactionRoleOptions.id, emojiIds[0]) // Get first for demo
              ));

            embed.addFields({
              name: `${group.groupName} (${group.groupType})`,
              value: `Emojis: ${emojiIds.length}\nMax roles: ${group.maxRoles}`,
              inline: true
            });
          }

          message.reply({ embeds: [embed] });
        } catch (error) {
          console.error('Failed to list groups:', error);
          message.reply('❌ Failed to list groups. Please try again.');
        }
      } else {
        message.reply('❌ Invalid group action. Use: `create`, `add`, or `list`');
      }
    }

    // LIST ALL REACTION ROLE MESSAGES
    else if (subcommand === 'list' || subcommand === 'all') {
      try {
        const messages = await db.select()
          .from(reactionRoleMessages)
          .where(eq(reactionRoleMessages.serverId, message.guild.id));

        if (messages.length === 0) {
          return message.reply('📋 No reaction role messages configured.');
        }

        const embed = new EmbedBuilder()
          .setColor('#3b82f6')
          .setTitle('🎭 Reaction Role Messages')
          .setDescription(`Total: **${messages.length}** message(s)`)
          .setTimestamp();

        for (const msg of messages.slice(0, 10)) {
          const channel = await client.channels.fetch(msg.channelId).catch(() => null);
          const optionsCount = await db.select()
            .from(reactionRoleOptions)
            .where(eq(reactionRoleOptions.messageConfigId, msg.id));

          embed.addFields({
            name: `Message ID: ${msg.messageId} ${msg.enabled ? '✅' : '🔒'}`,
            value: `Channel: ${channel?.toString() || 'Unknown'}\nReactions: ${optionsCount.length}\nStatus: ${msg.enabled ? 'Enabled' : 'Locked'}`,
            inline: false
          });
        }

        if (messages.length > 10) {
          embed.setFooter({ text: `Showing 10 of ${messages.length} messages` });
        }

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to list reaction role messages:', error);
        message.reply('❌ Failed to list messages. Please try again.');
      }
    }

    else {
      message.reply('❌ Unknown subcommand. Use `!rr` to see available commands.');
    }
  }
};

// Helper function to update reaction role embed with current options
async function updateReactionRoleEmbed(discordMessage, messageConfigId, db, client) {
  const { reactionRoleOptions } = require('../database/schema');
  const { eq } = require('drizzle-orm');

  try {
    // Get all options for this message
    const options = await db.select()
      .from(reactionRoleOptions)
      .where(eq(reactionRoleOptions.messageConfigId, messageConfigId));

    if (!discordMessage.embeds[0]) return;

    const embed = EmbedBuilder.from(discordMessage.embeds[0]);
    
    // Build roles list
    if (options.length > 0) {
      const rolesList = await Promise.all(options.map(async (opt) => {
        const role = await discordMessage.guild.roles.fetch(opt.roleId).catch(() => null);
        return `${opt.emoji} → ${role ? role.name : 'Unknown Role'}`;
      }));

      // Update or add field
      const existingFieldIndex = embed.data.fields?.findIndex(f => f.name === '📋 Available Roles');
      const rolesField = { name: '📋 Available Roles', value: rolesList.join('\n'), inline: false };

      if (existingFieldIndex !== undefined && existingFieldIndex >= 0) {
        embed.spliceFields(existingFieldIndex, 1, rolesField);
      } else {
        embed.addFields(rolesField);
      }
    }

    await discordMessage.edit({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to update reaction role embed:', error);
  }
}
