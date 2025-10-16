const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../database/db');
const { welcomeConfigs, leaveConfigs, boostConfigs } = require('../database/schema');
const { eq } = require('drizzle-orm');

const autoMessagesCommand = {
  data: new SlashCommandBuilder()
    .setName('automessages')
    .setDescription('⚙️ Cài đặt auto-messages (welcome/leave/boost) - Admin only')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const serverId = interaction.guild.id;
    
    // Lấy config của cả 3 hệ thống
    const welcomeConfig = await db.select().from(welcomeConfigs)
      .where(eq(welcomeConfigs.serverId, serverId))
      .limit(1);
    
    const leaveConfig = await db.select().from(leaveConfigs)
      .where(eq(leaveConfigs.serverId, serverId))
      .limit(1);
    
    const boostConfig = await db.select().from(boostConfigs)
      .where(eq(boostConfigs.serverId, serverId))
      .limit(1);
    
    // Format giống Mimu bot
    const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
    const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
      ? `<#${welcomeConfig[0].channelId}>` 
      : 'no channel set';
    const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
      ? `\`${welcomeConfig[0].embedName}\`` 
      : 'no embed set';
    
    const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
    const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
      ? `<#${leaveConfig[0].channelId}>` 
      : 'no channel set';
    const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
      ? `\`${leaveConfig[0].embedName}\`` 
      : 'no embed set';
    
    const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
    const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
      ? `<#${boostConfig[0].channelId}>` 
      : 'no channel set';
    const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
      ? `\`${boostConfig[0].embedName}\`` 
      : 'no embed set';
    
    // Tạo embed theo style Mimu với dynamic icons
    const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Auto-Messages Settings')
      .setDescription('Quản lý các tin nhắn tự động khi user join/leave/boost server\n\n**Chọn hệ thống từ menu trên, sau đó chọn hành động từ menu dưới**')
      .setColor(0x5865F2)
      .addFields(
        { 
          name: `${welcomeIcon} welcoming / greeting`, 
          value: `• **${welcomeEnabled ? 'enabled' : 'disabled'}** · to ${welcomeEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${welcomeChannel}\n• **embed**: ${welcomeEmbed}`, 
          inline: true 
        },
        { 
          name: `${leaveIcon} leaving`, 
          value: `• **${leaveEnabled ? 'enabled' : 'disabled'}** · to ${leaveEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${leaveChannel}\n• **embed**: ${leaveEmbed}`, 
          inline: true 
        },
        { 
          name: `${boostIcon} boosting`, 
          value: `• **${boostEnabled ? 'enabled' : 'disabled'}** · to ${boostEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${boostChannel}\n• **embed**: ${boostEmbed}`, 
          inline: true 
        }
      )
      .setFooter({ text: 'Menu 1: Chọn hệ thống | Menu 2: Chọn hành động' })
      .setTimestamp();
    
    // Dropdown 1: Chọn hệ thống
    const systemSelect = new StringSelectMenuBuilder()
      .setCustomId('automessages_system')
      .setPlaceholder('1️⃣ Chọn hệ thống')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Welcome Messages')
          .setDescription('Quản lý welcome messages')
          .setValue('welcome')
          .setEmoji({ id: '1427374340281864403', name: 'lena_welcome' }),
        new StringSelectMenuOptionBuilder()
          .setLabel('Leave Messages')
          .setDescription('Quản lý leave messages')
          .setValue('leave')
          .setEmoji({ id: '1427374409911373854', name: 'lena_bye' }),
        new StringSelectMenuOptionBuilder()
          .setLabel('Boost Messages')
          .setDescription('Quản lý boost messages')
          .setValue('boost')
          .setEmoji({ id: '1427375123869995148', name: 'lena_boost' }),
        new StringSelectMenuOptionBuilder()
          .setLabel('All Systems')
          .setDescription('Quản lý tất cả hệ thống')
          .setValue('all')
          .setEmoji({ id: '1427373655519789238', name: 'lena_confing' })
      );
    
    // Dropdown 2: Chọn hành động (mặc định cho "All")
    const actionSelect = new StringSelectMenuBuilder()
      .setCustomId('automessages_action')
      .setPlaceholder('2️⃣ Chọn hành động')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Enable ALL')
          .setDescription('Bật tất cả hệ thống')
          .setValue('all_enable')
          .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
        new StringSelectMenuOptionBuilder()
          .setLabel('Disable ALL')
          .setDescription('Tắt tất cả hệ thống')
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
};

async function handleAutoMessagesSystem(interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'automessages_system') return;
  
  const serverId = interaction.guild.id;
  const system = interaction.values[0];
  
  // Lấy config hiện tại
  const welcomeConfig = await db.select().from(welcomeConfigs)
    .where(eq(welcomeConfigs.serverId, serverId))
    .limit(1);
  
  const leaveConfig = await db.select().from(leaveConfigs)
    .where(eq(leaveConfigs.serverId, serverId))
    .limit(1);
  
  const boostConfig = await db.select().from(boostConfigs)
    .where(eq(boostConfigs.serverId, serverId))
    .limit(1);
  
  // Format giống Mimu bot
  const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
  const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
    ? `<#${welcomeConfig[0].channelId}>` 
    : 'no channel set';
  const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
    ? `\`${welcomeConfig[0].embedName}\`` 
    : 'no embed set';
  
  const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
  const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
    ? `<#${leaveConfig[0].channelId}>` 
    : 'no channel set';
  const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
    ? `\`${leaveConfig[0].embedName}\`` 
    : 'no embed set';
  
  const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
  const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
    ? `<#${boostConfig[0].channelId}>` 
    : 'no channel set';
  const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
    ? `\`${boostConfig[0].embedName}\`` 
    : 'no embed set';
  
  // Highlight hệ thống đã chọn
  let description = 'Quản lý các tin nhắn tự động khi user join/leave/boost server\n\n';
  if (system === 'welcome') {
    description += '**🎯 Đang chọn: Welcome Messages**';
  } else if (system === 'leave') {
    description += '**🎯 Đang chọn: Leave Messages**';
  } else if (system === 'boost') {
    description += '**🎯 Đang chọn: Boost Messages**';
  } else if (system === 'all') {
    description += '**🎯 Đang chọn: All Systems**';
  }
  
  // Dynamic icons dựa trên trạng thái
  const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Auto-Messages Settings')
    .setDescription(description)
    .setColor(0x5865F2)
    .addFields(
      { 
        name: `${welcomeIcon} welcoming / greeting`, 
        value: `• **${welcomeEnabled ? 'enabled' : 'disabled'}** · to ${welcomeEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${welcomeChannel}\n• **embed**: ${welcomeEmbed}`, 
        inline: true 
      },
      { 
        name: `${leaveIcon} leaving`, 
        value: `• **${leaveEnabled ? 'enabled' : 'disabled'}** · to ${leaveEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${leaveChannel}\n• **embed**: ${leaveEmbed}`, 
        inline: true 
      },
      { 
        name: `${boostIcon} boosting`, 
        value: `• **${boostEnabled ? 'enabled' : 'disabled'}** · to ${boostEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${boostChannel}\n• **embed**: ${boostEmbed}`, 
        inline: true 
      }
    )
    .setFooter({ text: 'Menu 1: Chọn hệ thống | Menu 2: Chọn hành động' })
    .setTimestamp();
  
  // Dropdown 1: System (keep same)
  const systemSelect = new StringSelectMenuBuilder()
    .setCustomId('automessages_system')
    .setPlaceholder('1️⃣ Chọn hệ thống')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Welcome Messages')
        .setDescription('Quản lý welcome messages')
        .setValue('welcome')
        .setEmoji('👋')
        .setDefault(system === 'welcome'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Leave Messages')
        .setDescription('Quản lý leave messages')
        .setValue('leave')
        .setEmoji('👋')
        .setDefault(system === 'leave'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Boost Messages')
        .setDescription('Quản lý boost messages')
        .setValue('boost')
        .setEmoji('💎')
        .setDefault(system === 'boost'),
      new StringSelectMenuOptionBuilder()
        .setLabel('All Systems')
        .setDescription('Quản lý tất cả hệ thống')
        .setValue('all')
        .setEmoji('⚙️')
        .setDefault(system === 'all')
    );
  
  // Dropdown 2: Actions (change based on system)
  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('automessages_action')
    .setPlaceholder('2️⃣ Chọn hành động');
  
  if (system === 'all') {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Enable ALL')
        .setDescription('Bật tất cả hệ thống')
        .setValue('all_enable')
        .setEmoji('1427367518208528495'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Disable ALL')
        .setDescription('Tắt tất cả hệ thống')
        .setValue('all_disable')
        .setEmoji('1427367582565925045')
    );
  } else {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Enable')
        .setDescription(`Bật ${system} messages`)
        .setValue(`${system}_enable`)
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Disable')
        .setDescription(`Tắt ${system} messages`)
        .setValue(`${system}_disable`)
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Set Channel')
        .setDescription(`Chọn kênh cho ${system} messages`)
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

async function handleAutoMessagesAction(interaction) {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== 'automessages_action') return;
  
  const serverId = interaction.guild.id;
  const value = interaction.values[0];
  const [system, action] = value.split('_'); // welcome_enable → ["welcome", "enable"]
  
  try {
    // Handle enable/disable actions
    if (action === 'enable' || action === 'disable') {
      const isEnable = action === 'enable';
      
      if (system === 'all') {
        // Enable/Disable all
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
        // Handle individual system
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
      
      // Update embed with system info using interaction.update
      await updateAutoMessagesEmbedNewWithUpdate(interaction, system);
    } else if (action === 'channel') {
      // Update current message to show channel select
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId(`automessages_${system}_channel`)
        .setPlaceholder(`Chọn kênh cho ${system} messages`)
        .setChannelTypes(ChannelType.GuildText);
      
      const row = new ActionRowBuilder().addComponents(channelSelect);
      
      await interaction.update({
        content: `📍 Chọn kênh để gửi ${system} messages:`,
        embeds: [],
        components: [row]
      });
      return;
    }
  } catch (error) {
    console.error('Error handling auto-messages action:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }
  }
}

async function updateAutoMessagesEmbedNewWithUpdate(interaction, system = 'all') {
  const serverId = interaction.guild.id;
  
  // Lấy config mới
  const welcomeConfig = await db.select().from(welcomeConfigs)
    .where(eq(welcomeConfigs.serverId, serverId))
    .limit(1);
  
  const leaveConfig = await db.select().from(leaveConfigs)
    .where(eq(leaveConfigs.serverId, serverId))
    .limit(1);
  
  const boostConfig = await db.select().from(boostConfigs)
    .where(eq(boostConfigs.serverId, serverId))
    .limit(1);
  
  // Format giống Mimu bot
  const welcomeEnabled = welcomeConfig.length > 0 && welcomeConfig[0].isActive;
  const welcomeChannel = welcomeConfig.length > 0 && welcomeConfig[0].channelId 
    ? `<#${welcomeConfig[0].channelId}>` 
    : 'no channel set';
  const welcomeEmbed = welcomeConfig.length > 0 && welcomeConfig[0].embedName 
    ? `\`${welcomeConfig[0].embedName}\`` 
    : 'no embed set';
  
  const leaveEnabled = leaveConfig.length > 0 && leaveConfig[0].isActive;
  const leaveChannel = leaveConfig.length > 0 && leaveConfig[0].channelId 
    ? `<#${leaveConfig[0].channelId}>` 
    : 'no channel set';
  const leaveEmbed = leaveConfig.length > 0 && leaveConfig[0].embedName 
    ? `\`${leaveConfig[0].embedName}\`` 
    : 'no embed set';
  
  const boostEnabled = boostConfig.length > 0 && boostConfig[0].isActive;
  const boostChannel = boostConfig.length > 0 && boostConfig[0].channelId 
    ? `<#${boostConfig[0].channelId}>` 
    : 'no channel set';
  const boostEmbed = boostConfig.length > 0 && boostConfig[0].embedName 
    ? `\`${boostConfig[0].embedName}\`` 
    : 'no embed set';
  
  // Highlight hệ thống đã chọn
  let description = 'Quản lý các tin nhắn tự động khi user join/leave/boost server\n\n';
  if (system === 'welcome') {
    description += '**🎯 Đang chọn: Welcome Messages**';
  } else if (system === 'leave') {
    description += '**🎯 Đang chọn: Leave Messages**';
  } else if (system === 'boost') {
    description += '**🎯 Đang chọn: Boost Messages**';
  } else if (system === 'all') {
    description += '**🎯 Đang chọn: All Systems**';
  }
  
  // Dynamic icons dựa trên trạng thái
  const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
  
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Auto-Messages Settings')
    .setDescription(description)
    .setColor(0x5865F2)
    .addFields(
      { 
        name: `${welcomeIcon} welcoming / greeting`, 
        value: `• **${welcomeEnabled ? 'enabled' : 'disabled'}** · to ${welcomeEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${welcomeChannel}\n• **embed**: ${welcomeEmbed}`, 
        inline: true 
      },
      { 
        name: `${leaveIcon} leaving`, 
        value: `• **${leaveEnabled ? 'enabled' : 'disabled'}** · to ${leaveEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${leaveChannel}\n• **embed**: ${leaveEmbed}`, 
        inline: true 
      },
      { 
        name: `${boostIcon} boosting`, 
        value: `• **${boostEnabled ? 'enabled' : 'disabled'}** · to ${boostEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${boostChannel}\n• **embed**: ${boostEmbed}`, 
        inline: true 
      }
    )
    .setFooter({ text: 'Menu 1: Chọn hệ thống | Menu 2: Chọn hành động' })
    .setTimestamp();
  
  // Dropdown 1: System (with current selection)
  const systemSelect = new StringSelectMenuBuilder()
    .setCustomId('automessages_system')
    .setPlaceholder('1️⃣ Chọn hệ thống')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Welcome Messages')
        .setDescription('Quản lý welcome messages')
        .setValue('welcome')
        .setEmoji('👋')
        .setDefault(system === 'welcome'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Leave Messages')
        .setDescription('Quản lý leave messages')
        .setValue('leave')
        .setEmoji('👋')
        .setDefault(system === 'leave'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Boost Messages')
        .setDescription('Quản lý boost messages')
        .setValue('boost')
        .setEmoji('💎')
        .setDefault(system === 'boost'),
      new StringSelectMenuOptionBuilder()
        .setLabel('All Systems')
        .setDescription('Quản lý tất cả hệ thống')
        .setValue('all')
        .setEmoji('⚙️')
        .setDefault(system === 'all')
    );
  
  // Dropdown 2: Actions (change based on system)
  const actionSelect = new StringSelectMenuBuilder()
    .setCustomId('automessages_action')
    .setPlaceholder('2️⃣ Chọn hành động');
  
  if (system === 'all') {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Enable ALL')
        .setDescription('Bật tất cả hệ thống')
        .setValue('all_enable')
        .setEmoji('1427367518208528495'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Disable ALL')
        .setDescription('Tắt tất cả hệ thống')
        .setValue('all_disable')
        .setEmoji('1427367582565925045')
    );
  } else {
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Enable')
        .setDescription(`Bật ${system} messages`)
        .setValue(`${system}_enable`)
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Disable')
        .setDescription(`Tắt ${system} messages`)
        .setValue(`${system}_disable`)
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Set Channel')
        .setDescription(`Chọn kênh cho ${system} messages`)
        .setValue(`${system}_channel`)
        .setEmoji({ id: '1427367646835380357', name: 'lena_channel' })
    );
  }
  
  const row1 = new ActionRowBuilder().addComponents(systemSelect);
  const row2 = new ActionRowBuilder().addComponents(actionSelect);
  
  try {
    await interaction.update({ embeds: [embed], components: [row1, row2] });
  } catch (error) {
    console.error('Error updating embed with interaction.update:', error);
  }
}

async function handleChannelSelection(interaction) {
  if (!interaction.isChannelSelectMenu()) return;
  
  const serverId = interaction.guild.id;
  const channelId = interaction.values[0];
  
  try {
    // Parse customId to get system
    // Format: automessages_{system}_channel
    const parts = interaction.customId.split('_');
    const system = parts[1]; // welcome, leave, or boost
    
    if (system === 'welcome') {
      const config = await db.select().from(welcomeConfigs)
        .where(eq(welcomeConfigs.serverId, serverId))
        .limit(1);
      
      if (config.length === 0) {
        await db.insert(welcomeConfigs).values({ serverId, channelId });
      } else {
        await db.update(welcomeConfigs)
          .set({ channelId, updatedAt: new Date() })
          .where(eq(welcomeConfigs.serverId, serverId));
      }
    } else if (system === 'leave') {
      const config = await db.select().from(leaveConfigs)
        .where(eq(leaveConfigs.serverId, serverId))
        .limit(1);
      
      if (config.length === 0) {
        await db.insert(leaveConfigs).values({ serverId, channelId });
      } else {
        await db.update(leaveConfigs)
          .set({ channelId, updatedAt: new Date() })
          .where(eq(leaveConfigs.serverId, serverId));
      }
    } else if (system === 'boost') {
      const config = await db.select().from(boostConfigs)
        .where(eq(boostConfigs.serverId, serverId))
        .limit(1);
      
      if (config.length === 0) {
        await db.insert(boostConfigs).values({ serverId, channelId });
      } else {
        await db.update(boostConfigs)
          .set({ channelId, updatedAt: new Date() })
          .where(eq(boostConfigs.serverId, serverId));
      }
    }
    
    // Get fresh config data
    const [welcomeC] = await db.select().from(welcomeConfigs).where(eq(welcomeConfigs.serverId, serverId)).limit(1);
    const [leaveC] = await db.select().from(leaveConfigs).where(eq(leaveConfigs.serverId, serverId)).limit(1);
    const [boostC] = await db.select().from(boostConfigs).where(eq(boostConfigs.serverId, serverId)).limit(1);
    
    // Format embed
    const welcomeEnabled = welcomeC && welcomeC.isActive;
    const welcomeChannel = welcomeC && welcomeC.channelId ? `<#${welcomeC.channelId}>` : 'no channel set';
    const welcomeEmbed = welcomeC && welcomeC.embedName ? `\`${welcomeC.embedName}\`` : 'no embed set';
    
    const leaveEnabled = leaveC && leaveC.isActive;
    const leaveChannel = leaveC && leaveC.channelId ? `<#${leaveC.channelId}>` : 'no channel set';
    const leaveEmbed = leaveC && leaveC.embedName ? `\`${leaveC.embedName}\`` : 'no embed set';
    
    const boostEnabled = boostC && boostC.isActive;
    const boostChannel = boostC && boostC.channelId ? `<#${boostC.channelId}>` : 'no channel set';
    const boostEmbed = boostC && boostC.embedName ? `\`${boostC.embedName}\`` : 'no embed set';
    
    // Dynamic icons dựa trên trạng thái
    const welcomeIcon = welcomeEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    const leaveIcon = leaveEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    const boostIcon = boostEnabled ? '<:lena_on:1427367518208528495>' : '<:lena_off:1427367582565925045>';
    
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Auto-Messages Settings')
      .setDescription('Quản lý các tin nhắn tự động khi user join/leave/boost server\n\n**Chọn hệ thống từ menu trên, sau đó chọn hành động từ menu dưới**')
      .setColor(0x5865F2)
      .addFields(
        { 
          name: `${welcomeIcon} welcoming / greeting`, 
          value: `• **${welcomeEnabled ? 'enabled' : 'disabled'}** · to ${welcomeEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${welcomeChannel}\n• **embed**: ${welcomeEmbed}`, 
          inline: true 
        },
        { 
          name: `${leaveIcon} leaving`, 
          value: `• **${leaveEnabled ? 'enabled' : 'disabled'}** · to ${leaveEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${leaveChannel}\n• **embed**: ${leaveEmbed}`, 
          inline: true 
        },
        { 
          name: `${boostIcon} boosting`, 
          value: `• **${boostEnabled ? 'enabled' : 'disabled'}** · to ${boostEnabled ? 'disable' : 'enable'}, use menu\n**settings:**\n• **channel**: ${boostChannel}\n• **embed**: ${boostEmbed}`, 
          inline: true 
        }
      )
      .setFooter({ text: 'Menu 1: Chọn hệ thống | Menu 2: Chọn hành động' })
      .setTimestamp();
    
    // Create system dropdown with current system selected
    const systemSelect = new StringSelectMenuBuilder()
      .setCustomId('automessages_system')
      .setPlaceholder('1️⃣ Chọn hệ thống')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Welcome Messages')
          .setDescription('Quản lý welcome messages')
          .setValue('welcome')
          .setEmoji('👋')
          .setDefault(system === 'welcome'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Leave Messages')
          .setDescription('Quản lý leave messages')
          .setValue('leave')
          .setEmoji('👋')
          .setDefault(system === 'leave'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Boost Messages')
          .setDescription('Quản lý boost messages')
          .setValue('boost')
          .setEmoji('💎')
          .setDefault(system === 'boost'),
        new StringSelectMenuOptionBuilder()
          .setLabel('All Systems')
          .setDescription('Quản lý tất cả hệ thống')
          .setValue('all')
          .setEmoji({ id: '1427373655519789238', name: 'lena_confing' })
          .setDefault(false)
      );
    
    // Create action dropdown based on system
    const actionSelect = new StringSelectMenuBuilder()
      .setCustomId('automessages_action')
      .setPlaceholder('2️⃣ Chọn hành động');
    
    actionSelect.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Enable')
        .setDescription(`Bật ${system} messages`)
        .setValue(`${system}_enable`)
        .setEmoji({ id: '1427367518208528495', name: 'lena_on' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Toggle Disable')
        .setDescription(`Tắt ${system} messages`)
        .setValue(`${system}_disable`)
        .setEmoji({ id: '1427367582565925045', name: 'lena_off' }),
      new StringSelectMenuOptionBuilder()
        .setLabel('Set Channel')
        .setDescription(`Chọn kênh cho ${system} messages`)
        .setValue(`${system}_channel`)
        .setEmoji({ id: '1427367646835380357', name: 'lena_channel' })
    );
    
    const row1 = new ActionRowBuilder().addComponents(systemSelect);
    const row2 = new ActionRowBuilder().addComponents(actionSelect);
    
    // Update message with settings embed and dropdowns
    await interaction.update({
      content: null,
      embeds: [embed],
      components: [row1, row2]
    });
  } catch (error) {
    console.error('Error setting channel:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }
  }
}

module.exports = {
  autoMessagesCommand,
  handleAutoMessagesSystem,
  handleAutoMessagesAction,
  handleChannelSelection
};
