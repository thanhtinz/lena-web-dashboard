const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { db } = require('../database/db');
const { welcomeConfigs, leaveConfigs, boostConfigs, customEmbeds } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { getServerTranslator } = require('../i18n');

async function parseVariables(text, member, guild) {
  if (!text) return text;
  
  const memberCount = guild.memberCount;
  const boostCount = guild.premiumSubscriptionCount || 0;
  const boostTier = guild.premiumTier || 0;
  
  // Calculate boosts needed for next tier
  // Tier 0 -> 1: 2 boosts, Tier 1 -> 2: 7 boosts, Tier 2 -> 3: 14 boosts
  const boostRequirements = { 0: 2, 1: 7, 2: 14, 3: 0 };
  const nextTierRequired = boostRequirements[boostTier] || 0;
  const boostsUntilNextLevel = nextTierRequired > 0 ? Math.max(0, nextTierRequired - boostCount) : 0;
  
  // Create ordinal number (1st, 2nd, 3rd, etc.)
  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  const memberCountOrdinal = getOrdinal(memberCount);
  
  let parsed = text
    .replace(/\{user\}/gi, `<@${member.id}>`)
    .replace(/\{user_mention\}/gi, `<@${member.id}>`)
    .replace(/\{user_name\}/gi, member.user.username)
    .replace(/\{user_tag\}/gi, member.user.tag)
    .replace(/\{user_id\}/gi, member.id)
    .replace(/\{user_avatar\}/gi, member.user.displayAvatarURL({ dynamic: true }))
    .replace(/\{server_name\}/gi, guild.name)
    .replace(/\{server_id\}/gi, guild.id)
    .replace(/\{server_membercount_ordinal\}/gi, memberCountOrdinal)
    .replace(/\{server_membercount\}/gi, memberCount.toString())
    .replace(/\{server_boostcount\}/gi, boostCount.toString())
    .replace(/\{server_nextboostlevel_until_required\}/gi, boostsUntilNextLevel.toString())
    .replace(/\{server_boostlevel\}/gi, boostTier.toString())
    .replace(/\{server_icon\}/gi, guild.iconURL({ dynamic: true }) || '')
    .replace(/\{newline\}/gi, '\n');
  
  return parsed;
}

async function getEmbedFromName(serverId, embedName, member, guild) {
  if (!embedName) return null;
  
  try {
    const embedData = await db.select().from(customEmbeds)
      .where(and(
        eq(customEmbeds.serverId, serverId),
        eq(customEmbeds.name, embedName)
      ))
      .limit(1);
    
    if (embedData.length === 0) return null;
    
    const embed = new EmbedBuilder();
    const data = embedData[0];
    
    if (data.title) embed.setTitle(await parseVariables(data.title, member, guild));
    if (data.description) embed.setDescription(await parseVariables(data.description, member, guild));
    if (data.color) embed.setColor(data.color);
    if (data.authorName) {
      embed.setAuthor({
        name: await parseVariables(data.authorName, member, guild),
        iconURL: data.authorIcon ? await parseVariables(data.authorIcon, member, guild) : undefined
      });
    }
    if (data.footerText) {
      embed.setFooter({
        text: await parseVariables(data.footerText, member, guild),
        iconURL: data.footerIcon ? await parseVariables(data.footerIcon, member, guild) : undefined
      });
    }
    if (data.imageUrl) embed.setImage(await parseVariables(data.imageUrl, member, guild));
    if (data.thumbnailUrl) embed.setThumbnail(await parseVariables(data.thumbnailUrl, member, guild));
    if (data.fields) {
      try {
        const fields = JSON.parse(data.fields);
        for (const field of fields) {
          embed.addFields({
            name: await parseVariables(field.name, member, guild),
            value: await parseVariables(field.value, member, guild),
            inline: field.inline || false
          });
        }
      } catch (err) {
        console.error('Error parsing embed fields:', err);
      }
    }
    
    embed.setTimestamp();
    
    return embed;
  } catch (error) {
    console.error('Error building embed:', error);
    return null;
  }
}

async function sendWelcomeMessage(member) {
  try {
    const config = await db.select().from(welcomeConfigs)
      .where(eq(welcomeConfigs.serverId, member.guild.id))
      .limit(1);
    
    if (config.length === 0 || !config[0].isActive || !config[0].channelId) return;
    
    const channel = await member.guild.channels.fetch(config[0].channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    
    const messageContent = await parseVariables(config[0].message, member, member.guild);
    const embed = await getEmbedFromName(member.guild.id, config[0].embedName, member, member.guild);
    
    const payload = {};
    if (messageContent) payload.content = messageContent;
    if (embed) payload.embeds = [embed];
    
    if (payload.content || payload.embeds) {
      await channel.send(payload);
    }
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

async function sendLeaveMessage(member) {
  try {
    const config = await db.select().from(leaveConfigs)
      .where(eq(leaveConfigs.serverId, member.guild.id))
      .limit(1);
    
    if (config.length === 0 || !config[0].isActive || !config[0].channelId) return;
    
    const channel = await member.guild.channels.fetch(config[0].channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    
    const messageContent = await parseVariables(config[0].message, member, member.guild);
    const embed = await getEmbedFromName(member.guild.id, config[0].embedName, member, member.guild);
    
    const payload = {};
    if (messageContent) payload.content = messageContent;
    if (embed) payload.embeds = [embed];
    
    if (payload.content || payload.embeds) {
      await channel.send(payload);
    }
  } catch (error) {
    console.error('Error sending leave message:', error);
  }
}

async function sendBoostMessage(member) {
  try {
    const config = await db.select().from(boostConfigs)
      .where(eq(boostConfigs.serverId, member.guild.id))
      .limit(1);
    
    if (config.length === 0 || !config[0].isActive || !config[0].channelId) return;
    
    const channel = await member.guild.channels.fetch(config[0].channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    
    const messageContent = await parseVariables(config[0].message, member, member.guild);
    const embed = await getEmbedFromName(member.guild.id, config[0].embedName, member, member.guild);
    
    const payload = {};
    if (messageContent) payload.content = messageContent;
    if (embed) payload.embeds = [embed];
    
    if (payload.content || payload.embeds) {
      await channel.send(payload);
    }
  } catch (error) {
    console.error('Error sending boost message:', error);
  }
}

const announcementsCommand = {
  data: new SlashCommandBuilder()
    .setName('announcements')
    .setDescription('📢 Setup server announcements (Welcome/Leave/Boost) - Admin only')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup(group =>
      group
        .setName('welcome')
        .setDescription('Welcome message settings')
        .addSubcommand(sub =>
          sub
            .setName('channel')
            .setDescription('Set welcome message channel')
            .addChannelOption(option =>
              option.setName('channel')
                .setDescription('Channel to send welcome messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('message')
            .setDescription('Set welcome message text')
            .addStringOption(option =>
              option.setName('text')
                .setDescription('Message text (use variables: {user}, {username}, {server})')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('embed')
            .setDescription('Attach embed to welcome message')
            .addStringOption(option =>
              option.setName('name')
                .setDescription('Embed name (from /embed list)')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('toggle')
            .setDescription('Enable/disable welcome messages')
            .addBooleanOption(option =>
              option.setName('enabled')
                .setDescription('Enable or disable')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('config')
            .setDescription('Show current welcome configuration'))
        .addSubcommand(sub =>
          sub
            .setName('test')
            .setDescription('Test your welcome message')))
    .addSubcommandGroup(group =>
      group
        .setName('leave')
        .setDescription('Leave message settings')
        .addSubcommand(sub =>
          sub
            .setName('channel')
            .setDescription('Set leave message channel')
            .addChannelOption(option =>
              option.setName('channel')
                .setDescription('Channel to send leave messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('message')
            .setDescription('Set leave message text')
            .addStringOption(option =>
              option.setName('text')
                .setDescription('Message text (use variables: {username}, {server})')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('embed')
            .setDescription('Attach embed to leave message')
            .addStringOption(option =>
              option.setName('name')
                .setDescription('Embed name (from /embed list)')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('toggle')
            .setDescription('Enable/disable leave messages')
            .addBooleanOption(option =>
              option.setName('enabled')
                .setDescription('Enable or disable')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('config')
            .setDescription('Show current leave configuration'))
        .addSubcommand(sub =>
          sub
            .setName('test')
            .setDescription('Test your leave message')))
    .addSubcommandGroup(group =>
      group
        .setName('boost')
        .setDescription('Boost message settings')
        .addSubcommand(sub =>
          sub
            .setName('channel')
            .setDescription('Set boost message channel')
            .addChannelOption(option =>
              option.setName('channel')
                .setDescription('Channel to send boost messages')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('message')
            .setDescription('Set boost message text')
            .addStringOption(option =>
              option.setName('text')
                .setDescription('Message text (use variables: {user}, {server})')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('embed')
            .setDescription('Attach embed to boost message')
            .addStringOption(option =>
              option.setName('name')
                .setDescription('Embed name (from /embed list)')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('toggle')
            .setDescription('Enable/disable boost messages')
            .addBooleanOption(option =>
              option.setName('enabled')
                .setDescription('Enable or disable')
                .setRequired(true)))
        .addSubcommand(sub =>
          sub
            .setName('config')
            .setDescription('Show current boost configuration'))
        .addSubcommand(sub =>
          sub
            .setName('test')
            .setDescription('Test your boost message')))
    .addSubcommand(sub =>
      sub
        .setName('overview')
        .setDescription('View all announcements settings with interactive UI')),
  
  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;
    
    if (subcommand === 'overview') {
      return await handleOverview(interaction);
    }
    
    const configMap = {
      'welcome': welcomeConfigs,
      'leave': leaveConfigs,
      'boost': boostConfigs
    };
    
    const configTable = configMap[group];
    
    let config = await db.select().from(configTable)
      .where(eq(configTable.serverId, serverId))
      .limit(1);
    
    if (config.length === 0) {
      await db.insert(configTable).values({
        serverId,
        isActive: false
      });
      config = await db.select().from(configTable)
        .where(eq(configTable.serverId, serverId))
        .limit(1);
    }
    
    switch (subcommand) {
      case 'channel': {
        const channel = interaction.options.getChannel('channel');
        await db.update(configTable)
          .set({ channelId: channel.id, updatedAt: new Date() })
          .where(eq(configTable.serverId, serverId));
        
        return interaction.reply({
          content: `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} channel set to ${channel}`,
          ephemeral: true
        });
      }
      
      case 'message': {
        const message = interaction.options.getString('text');
        await db.update(configTable)
          .set({ message, updatedAt: new Date() })
          .where(eq(configTable.serverId, serverId));
        
        return interaction.reply({
          content: `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} message updated!\n\n**Preview:** ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
          ephemeral: true
        });
      }
      
      case 'embed': {
        const embedName = interaction.options.getString('name');
        
        const embedExists = await db.select().from(customEmbeds)
          .where(and(
            eq(customEmbeds.serverId, serverId),
            eq(customEmbeds.name, embedName)
          ))
          .limit(1);
        
        if (embedExists.length === 0) {
          return interaction.reply({
            content: `❌ Embed "${embedName}" not found! Use \`/embed list\` to see available embeds.`,
            ephemeral: true
          });
        }
        
        await db.update(configTable)
          .set({ embedName, updatedAt: new Date() })
          .where(eq(configTable.serverId, serverId));
        
        return interaction.reply({
          content: `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} embed set to: **${embedName}**`,
          ephemeral: true
        });
      }
      
      case 'toggle': {
        const enabled = interaction.options.getBoolean('enabled');
        await db.update(configTable)
          .set({ isActive: enabled, updatedAt: new Date() })
          .where(eq(configTable.serverId, serverId));
        
        return interaction.reply({
          content: `✅ ${group.charAt(0).toUpperCase() + group.slice(1)} messages ${enabled ? '**enabled**' : '**disabled**'}`,
          ephemeral: true
        });
      }
      
      case 'config': {
        const cfg = config[0];
        const channel = cfg.channelId ? `<#${cfg.channelId}>` : '`Not set`';
        const message = cfg.message || '`Not set`';
        const embed = cfg.embedName || '`None`';
        const status = cfg.isActive ? '✅ Enabled' : '❌ Disabled';
        
        return interaction.reply({
          content: `**📢 ${group.charAt(0).toUpperCase() + group.slice(1)} Announcements Configuration**\n\n` +
                   `**Status:** ${status}\n` +
                   `**Channel:** ${channel}\n` +
                   `**Message:** ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}\n` +
                   `**Embed:** ${embed}`,
          ephemeral: true
        });
      }
      
      case 'test': {
        if (!config[0].channelId) {
          return interaction.reply({
            content: `❌ Please set a channel first using \`/announcements ${group} channel\``,
            ephemeral: true
          });
        }
        
        const sendFunctions = {
          'welcome': sendWelcomeMessage,
          'leave': sendLeaveMessage,
          'boost': sendBoostMessage
        };
        
        await sendFunctions[group](interaction.member);
        return interaction.reply({
          content: `✅ Test ${group} message sent!`,
          ephemeral: true
        });
      }
    }
  }
};

async function handleOverview(interaction) {
  const serverId = interaction.guild.id;
  const t = await getServerTranslator(db, serverId);
  
  const welcomeConfig = await db.select().from(welcomeConfigs)
    .where(eq(welcomeConfigs.serverId, serverId))
    .limit(1);
  
  const leaveConfig = await db.select().from(leaveConfigs)
    .where(eq(leaveConfigs.serverId, serverId))
    .limit(1);
  
  const boostConfig = await db.select().from(boostConfigs)
    .where(eq(boostConfigs.serverId, serverId))
    .limit(1);
  
  const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
  const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
    ? `<#${welcomeConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
    ? `\`${welcomeConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
  const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
    ? `<#${leaveConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
    ? `\`${leaveConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
  const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
    ? `<#${boostConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
    ? `\`${boostConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  
  const embed = new EmbedBuilder()
    .setTitle(t('announcements.overview.title'))
    .setDescription(t('announcements.overview.description'))
    .setColor(0x5865F2)
    .addFields(
      { 
        name: `${welcomeIcon} ${t('announcements.systems.welcoming')}`, 
        value: `• **${t(welcomeEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(welcomeEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${welcomeChannel}\n• **${t('announcements.settings.embed')}**: ${welcomeEmbed}`, 
        inline: true 
      },
      { 
        name: `${leaveIcon} ${t('announcements.systems.leaving')}`, 
        value: `• **${t(leaveEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(leaveEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${leaveChannel}\n• **${t('announcements.settings.embed')}**: ${leaveEmbed}`, 
        inline: true 
      },
      { 
        name: `${boostIcon} ${t('announcements.systems.boosting')}`, 
        value: `• **${t(boostEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(boostEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${boostChannel}\n• **${t('announcements.settings.embed')}**: ${boostEmbed}`, 
        inline: true 
      }
    )
    .setFooter({ text: t('announcements.overview.footer') })
    .setTimestamp();
  
  const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
  
  const systemSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_system')
    .setPlaceholder(t('announcements.menu.selectSystem'))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.welcome'))
        .setDescription(t('announcements.systemSelection.welcomeDesc'))
        .setValue('welcome')
        .setEmoji({ id: '1427374340281864403', name: 'lena_welcome' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.leave'))
        .setDescription(t('announcements.systemSelection.leaveDesc'))
        .setValue('leave')
        .setEmoji({ id: '1427374409911373854', name: 'lena_bye' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.boost'))
        .setDescription(t('announcements.systemSelection.boostDesc'))
        .setValue('boost')
        .setEmoji({ id: '1427375123869995148', name: 'lena_boost' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.all'))
        .setDescription(t('announcements.systemSelection.allDesc'))
        .setValue('all')
        .setEmoji({ id: '1427373655519789238', name: 'lena_confing' })
    );
  
  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_action')
    .setPlaceholder(t('announcements.menu.selectAction'))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.enableAll'))
        .setDescription(t('announcements.actions.enableAllDesc'))
        .setValue('all_enable')
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.disableAll'))
        .setDescription(t('announcements.actions.disableAllDesc'))
        .setValue('all_disable')
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' })
    );
  
  const row1 = new ActionRowBuilder().addComponents(systemSelect);
  const row2 = new ActionRowBuilder().addComponents(actionSelect);
  
  await interaction.reply({
    embeds: [embed],
    components: [row1, row2],
    ephemeral: true
  });
}

async function handleAnnouncementsSystemSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'announcements_system') return;
  
  const serverId = interaction.guild.id;
  const system = interaction.values[0];
  const t = await getServerTranslator(db, serverId);
  
  const welcomeConfig = await db.select().from(welcomeConfigs)
    .where(eq(welcomeConfigs.serverId, serverId))
    .limit(1);
  
  const leaveConfig = await db.select().from(leaveConfigs)
    .where(eq(leaveConfigs.serverId, serverId))
    .limit(1);
  
  const boostConfig = await db.select().from(boostConfigs)
    .where(eq(boostConfigs.serverId, serverId))
    .limit(1);
  
  const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
  const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
    ? `<#${welcomeConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
    ? `\`${welcomeConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
  const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
    ? `<#${leaveConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
    ? `\`${leaveConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
  const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
    ? `<#${boostConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
    ? `\`${boostConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  let description = t('announcements.overview.description') + '\n\n';
  const systemLabels = {
    'welcome': t('announcements.systems.welcome'),
    'leave': t('announcements.systems.leave'),
    'boost': t('announcements.systems.boost'),
    'all': t('announcements.systems.all')
  };
  description += `**🎯 ${t('announcements.systemSelection.selected')}: ${systemLabels[system]}**`;
  
  const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  
  const embed = new EmbedBuilder()
    .setTitle(t('announcements.overview.title'))
    .setDescription(description)
    .setColor(0x5865F2)
    .addFields(
      { 
        name: `${welcomeIcon} ${t('announcements.systems.welcoming')}`, 
        value: `• **${t(welcomeEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(welcomeEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${welcomeChannel}\n• **${t('announcements.settings.embed')}**: ${welcomeEmbed}`, 
        inline: true 
      },
      { 
        name: `${leaveIcon} ${t('announcements.systems.leaving')}`, 
        value: `• **${t(leaveEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(leaveEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${leaveChannel}\n• **${t('announcements.settings.embed')}**: ${leaveEmbed}`, 
        inline: true 
      },
      { 
        name: `${boostIcon} ${t('announcements.systems.boosting')}`, 
        value: `• **${t(boostEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(boostEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${boostChannel}\n• **${t('announcements.settings.embed')}**: ${boostEmbed}`, 
        inline: true 
      }
    )
    .setFooter({ text: t('announcements.overview.footer') })
    .setTimestamp();
  
  const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
  
  const systemSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_system')
    .setPlaceholder(t('announcements.menu.selectSystem'))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.welcome'))
        .setDescription(t('announcements.systemSelection.welcomeDesc'))
        .setValue('welcome')
        .setEmoji('👋')
        .setDefault(system === 'welcome'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.leave'))
        .setDescription(t('announcements.systemSelection.leaveDesc'))
        .setValue('leave')
        .setEmoji('👋')
        .setDefault(system === 'leave'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.boost'))
        .setDescription(t('announcements.systemSelection.boostDesc'))
        .setValue('boost')
        .setEmoji('💎')
        .setDefault(system === 'boost'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.all'))
        .setDescription(t('announcements.systemSelection.allDesc'))
        .setValue('all')
        .setEmoji('⚙️')
        .setDefault(system === 'all')
    );
  
  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_action')
    .setPlaceholder(t('announcements.menu.selectAction'));
  
  if (system === 'all') {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.enableAll'))
        .setDescription(t('announcements.actions.enableAllDesc'))
        .setValue('all_enable')
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.disableAll'))
        .setDescription(t('announcements.actions.disableAllDesc'))
        .setValue('all_disable')
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' })
    );
  } else {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.enable'))
        .setDescription(t('announcements.actions.enableDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_enable`)
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.disable'))
        .setDescription(t('announcements.actions.disableDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_disable`)
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.setChannel'))
        .setDescription(t('announcements.actions.setChannelDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_channel`)
        .setEmoji({ id: '1427367646835380357', name: 'lena_channel' })
    );
  }
  
  const row1 = new ActionRowBuilder().addComponents(systemSelect);
  const row2 = new ActionRowBuilder().addComponents(actionSelect);
  
  await interaction.update({
    embeds: [embed],
    components: [row1, row2]
  });
}

async function handleAnnouncementsActionSelect(interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'announcements_action') return;
  
  const serverId = interaction.guild.id;
  const value = interaction.values[0];
  const [system, action] = value.split('_');
  const t = await getServerTranslator(db, serverId);
  
  try {
    if (action === 'enable' || action === 'disable') {
      const isEnable = action === 'enable';
      
      if (system === 'all') {
        const updates = [];
        
        const welcomeExists = await db.select().from(welcomeConfigs)
          .where(eq(welcomeConfigs.serverId, serverId)).limit(1);
        if (welcomeExists.length === 0 && isEnable) {
          await db.insert(welcomeConfigs).values({ serverId, isActive: true });
        } else if (welcomeExists.length > 0) {
          updates.push(db.update(welcomeConfigs)
            .set({ isActive: isEnable, updatedAt: new Date() })
            .where(eq(welcomeConfigs.serverId, serverId)));
        }
        
        const leaveExists = await db.select().from(leaveConfigs)
          .where(eq(leaveConfigs.serverId, serverId)).limit(1);
        if (leaveExists.length === 0 && isEnable) {
          await db.insert(leaveConfigs).values({ serverId, isActive: true });
        } else if (leaveExists.length > 0) {
          updates.push(db.update(leaveConfigs)
            .set({ isActive: isEnable, updatedAt: new Date() })
            .where(eq(leaveConfigs.serverId, serverId)));
        }
        
        const boostExists = await db.select().from(boostConfigs)
          .where(eq(boostConfigs.serverId, serverId)).limit(1);
        if (boostExists.length === 0 && isEnable) {
          await db.insert(boostConfigs).values({ serverId, isActive: true });
        } else if (boostExists.length > 0) {
          updates.push(db.update(boostConfigs)
            .set({ isActive: isEnable, updatedAt: new Date() })
            .where(eq(boostConfigs.serverId, serverId)));
        }
        
        await Promise.all(updates);
      } else {
        let configTable;
        if (system === 'welcome') {
          configTable = welcomeConfigs;
        } else if (system === 'leave') {
          configTable = leaveConfigs;
        } else if (system === 'boost') {
          configTable = boostConfigs;
        }
        
        const config = await db.select().from(configTable)
          .where(eq(configTable.serverId, serverId))
          .limit(1);
        
        if (config.length === 0) {
          await db.insert(configTable).values({ serverId, isActive: isEnable });
        } else {
          await db.update(configTable)
            .set({ isActive: isEnable, updatedAt: new Date() })
            .where(eq(configTable.serverId, serverId));
        }
      }
      
      await refreshAnnouncementsOverview(interaction, system);
    } else if (action === 'channel') {
      const { ChannelSelectMenuBuilder } = require('discord.js');
      const { ActionRowBuilder } = require('discord.js');
      
      const systemLabel = t(`announcements.systems.${system}`);
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`announcements_${system}_channel`)
        .setPlaceholder(t('announcements.menu.selectChannelPrompt', { system: systemLabel }))
        .setChannelTypes(ChannelType.GuildText);
      
      const row = new ActionRowBuilder().addComponents(channelSelect);
      
      await interaction.update({
        content: t('announcements.menu.selectChannelPrompt', { system: systemLabel }),
        embeds: [],
        components: [row]
      });
    }
  } catch (error) {
    console.error('Error handling announcements action:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: t('common.error'), ephemeral: true });
    }
  }
}

async function handleAnnouncementsChannelSelect(interaction) {
  if (!interaction.isChannelSelectMenu()) return;
  if (!interaction.customId.startsWith('announcements_')) return;
  if (!interaction.customId.endsWith('_channel')) return;
  
  const parts = interaction.customId.split('_');
  const system = parts[1];
  const serverId = interaction.guild.id;
  const channelId = interaction.values[0];
  const t = await getServerTranslator(db, serverId);
  
  try {
    let configTable;
    if (system === 'welcome') {
      configTable = welcomeConfigs;
    } else if (system === 'leave') {
      configTable = leaveConfigs;
    } else if (system === 'boost') {
      configTable = boostConfigs;
    }
    
    const config = await db.select().from(configTable)
      .where(eq(configTable.serverId, serverId))
      .limit(1);
    
    if (config.length === 0) {
      await db.insert(configTable).values({ serverId, channelId, isActive: false });
    } else {
      await db.update(configTable)
        .set({ channelId, updatedAt: new Date() })
        .where(eq(configTable.serverId, serverId));
    }
    
    await refreshAnnouncementsOverview(interaction, system);
  } catch (error) {
    console.error('Error setting channel:', error);
    await interaction.reply({ content: t('common.error'), ephemeral: true });
  }
}

async function refreshAnnouncementsOverview(interaction, system = 'all') {
  const serverId = interaction.guild.id;
  const t = await getServerTranslator(db, serverId);
  
  const welcomeConfig = await db.select().from(welcomeConfigs)
    .where(eq(welcomeConfigs.serverId, serverId))
    .limit(1);
  
  const leaveConfig = await db.select().from(leaveConfigs)
    .where(eq(leaveConfigs.serverId, serverId))
    .limit(1);
  
  const boostConfig = await db.select().from(boostConfigs)
    .where(eq(boostConfigs.serverId, serverId))
    .limit(1);
  
  const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
  const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
    ? `<#${welcomeConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
    ? `\`${welcomeConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
  const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
    ? `<#${leaveConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
    ? `\`${leaveConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
  const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
    ? `<#${boostConfig[0].channelId}>` 
    : t('announcements.settings.noChannel');
  const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
    ? `\`${boostConfig[0].embedName}\`` 
    : t('announcements.settings.noEmbed');
  
  let description = t('announcements.overview.description') + '\n\n';
  const systemLabels = {
    'welcome': t('announcements.systems.welcome'),
    'leave': t('announcements.systems.leave'),
    'boost': t('announcements.systems.boost'),
    'all': t('announcements.systems.all')
  };
  description += `**🎯 ${t('announcements.systemSelection.selected')}: ${systemLabels[system]}**`;
  
  const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  
  const embed = new EmbedBuilder()
    .setTitle(t('announcements.overview.title'))
    .setDescription(description)
    .setColor(0x5865F2)
    .addFields(
      { 
        name: `${welcomeIcon} ${t('announcements.systems.welcoming')}`, 
        value: `• **${t(welcomeEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(welcomeEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${welcomeChannel}\n• **${t('announcements.settings.embed')}**: ${welcomeEmbed}`, 
        inline: true 
      },
      { 
        name: `${leaveIcon} ${t('announcements.systems.leaving')}`, 
        value: `• **${t(leaveEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(leaveEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${leaveChannel}\n• **${t('announcements.settings.embed')}**: ${leaveEmbed}`, 
        inline: true 
      },
      { 
        name: `${boostIcon} ${t('announcements.systems.boosting')}`, 
        value: `• **${t(boostEnabled ? 'announcements.status.enabled' : 'announcements.status.disabled')}** · ${t(boostEnabled ? 'announcements.status.toDisable' : 'announcements.status.toEnable')}, ${t('announcements.status.useMenu')}\n**${t('announcements.settings.title')}**\n• **${t('announcements.settings.channel')}**: ${boostChannel}\n• **${t('announcements.settings.embed')}**: ${boostEmbed}`, 
        inline: true 
      }
    )
    .setFooter({ text: t('announcements.overview.footer') })
    .setTimestamp();
  
  const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
  
  const systemSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_system')
    .setPlaceholder(t('announcements.menu.selectSystem'))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.welcome'))
        .setDescription(t('announcements.systemSelection.welcomeDesc'))
        .setValue('welcome')
        .setEmoji('👋')
        .setDefault(system === 'welcome'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.leave'))
        .setDescription(t('announcements.systemSelection.leaveDesc'))
        .setValue('leave')
        .setEmoji('👋')
        .setDefault(system === 'leave'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.boost'))
        .setDescription(t('announcements.systemSelection.boostDesc'))
        .setValue('boost')
        .setEmoji('💎')
        .setDefault(system === 'boost'),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.systems.all'))
        .setDescription(t('announcements.systemSelection.allDesc'))
        .setValue('all')
        .setEmoji('⚙️')
        .setDefault(system === 'all')
    );
  
  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('announcements_action')
    .setPlaceholder(t('announcements.menu.selectAction'));
  
  if (system === 'all') {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.enableAll'))
        .setDescription(t('announcements.actions.enableAllDesc'))
        .setValue('all_enable')
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.disableAll'))
        .setDescription(t('announcements.actions.disableAllDesc'))
        .setValue('all_disable')
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' })
    );
  } else {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.enable'))
        .setDescription(t('announcements.actions.enableDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_enable`)
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.disable'))
        .setDescription(t('announcements.actions.disableDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_disable`)
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' }),
      new StringSelectMenuOptionBuilder()
        .setLabel(t('announcements.actions.setChannel'))
        .setDescription(t('announcements.actions.setChannelDesc', { system: t(`announcements.systems.${system}`) }))
        .setValue(`${system}_channel`)
        .setEmoji({ id: '1427367646835380357', name: 'lena_channel' })
    );
  }
  
  const row1 = new ActionRowBuilder().addComponents(systemSelect);
  const row2 = new ActionRowBuilder().addComponents(actionSelect);
  
  await interaction.update({
    content: null,
    embeds: [embed],
    components: [row1, row2]
  });
}

module.exports = {
  announcementsCommand,
  sendWelcomeMessage,
  sendLeaveMessage,
  sendBoostMessage,
  handleAnnouncementsSystemSelect,
  handleAnnouncementsActionSelect,
  handleAnnouncementsChannelSelect
};
