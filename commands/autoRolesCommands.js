const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

async function handleAutoRoles(message, args, db) {
  const { autoRolesConfig, autoRoleBlacklist, roleAuditLogs } = require('../database/schema');
  const { eq, and } = require('drizzle-orm');
  
  if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return message.reply('❌ Bạn cần quyền Manage Roles để cấu hình auto roles!');
  }

  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  if (subcommand === 'on' || subcommand === 'off') {
    const enabled = subcommand === 'on';
    
    const existing = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoRolesConfig).values({
        serverId: serverId,
        enabled: enabled
      });
    } else {
      await db.update(autoRolesConfig)
        .set({ enabled: enabled, updatedAt: new Date() })
        .where(eq(autoRolesConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${enabled ? '✅' : '❌'} Auto Roles`)
      .setDescription(`Auto Roles đã được ${enabled ? 'bật' : 'tắt'}`)
      .setColor(enabled ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  if (subcommand === 'join') {
    const action = args[1]?.toLowerCase();
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
    
    if (!role) {
      return message.reply('❌ Vui lòng mention role hoặc cung cấp ID role!');
    }

    const existing = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, serverId)).limit(1);
    let joinRoleIds = existing.length > 0 ? existing[0].joinRoleIds || [] : [];

    if (action === 'add') {
      if (!joinRoleIds.includes(role.id)) {
        joinRoleIds.push(role.id);
      }
    } else if (action === 'remove') {
      joinRoleIds = joinRoleIds.filter(id => id !== role.id);
    } else {
      return message.reply('❌ Dùng: `!autoroles join add/remove @role`');
    }

    if (existing.length === 0) {
      await db.insert(autoRolesConfig).values({
        serverId: serverId,
        joinRoleIds: joinRoleIds
      });
    } else {
      await db.update(autoRolesConfig)
        .set({ joinRoleIds: joinRoleIds, updatedAt: new Date() })
        .where(eq(autoRolesConfig.serverId, serverId));
    }

    const embed = new EmbedBuilder()
      .setTitle(`${action === 'add' ? '➕' : '➖'} Join Role`)
      .setDescription(`${role} sẽ ${action === 'add' ? '' : 'không '} được tự động gán khi thành viên mới join`)
      .setColor(0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Reassign command - Enable/disable role reassignment
  if (subcommand === 'reassign') {
    const action = args[1]?.toLowerCase();
    
    if (action !== 'on' && action !== 'off') {
      return message.reply('❌ Dùng: `!autoroles reassign on/off`');
    }

    const enableReassign = action === 'on';
    const existing = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, serverId)).limit(1);

    if (existing.length === 0) {
      await db.insert(autoRolesConfig).values({
        serverId: serverId,
        enableReassign: enableReassign
      });
    } else {
      await db.update(autoRolesConfig)
        .set({ enableReassign: enableReassign, updatedAt: new Date() })
        .where(eq(autoRolesConfig.serverId, serverId));
    }

    // Log action
    await db.insert(roleAuditLogs).values({
      serverId: serverId,
      action: enableReassign ? 'enable_reassign' : 'disable_reassign',
      module: 'auto_roles',
      details: { feature: 'reassign', enabled: enableReassign },
      performedBy: message.author.id
    });

    const embed = new EmbedBuilder()
      .setTitle(`${enableReassign ? '✅' : '❌'} Role Reassignment`)
      .setDescription(
        enableReassign 
          ? 'Role reassignment đã được **bật**. Bot sẽ track và restore roles khi members rejoin!'
          : 'Role reassignment đã được **tắt**.'
      )
      .setColor(enableReassign ? 0x57F287 : 0xED4245)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Blacklist command - Manage blacklisted roles
  if (subcommand === 'blacklist') {
    const action = args[1]?.toLowerCase();

    // List blacklisted roles
    if (!action || action === 'list') {
      const blacklisted = await db.select().from(autoRoleBlacklist).where(eq(autoRoleBlacklist.serverId, serverId));
      
      if (blacklisted.length === 0) {
        return message.reply('📋 Chưa có role nào trong blacklist!');
      }

      const rolesList = blacklisted.map(b => `<@&${b.roleId}> - ${b.reason || 'Không có lý do'}`).join('\n');
      
      const embed = new EmbedBuilder()
        .setTitle('🚫 Blacklisted Roles')
        .setDescription(`Các roles sau sẽ **không** được reassign khi members rejoin:\n\n${rolesList}`)
        .setColor(0xED4245)
        .setFooter({ text: `Total: ${blacklisted.length} role(s)` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // Add to blacklist
    if (action === 'add') {
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
      const reason = args.slice(3).join(' ') || 'No reason provided';

      if (!role) {
        return message.reply('❌ Vui lòng mention role hoặc cung cấp ID role!');
      }

      // Check if already blacklisted
      const existing = await db.select().from(autoRoleBlacklist)
        .where(and(eq(autoRoleBlacklist.serverId, serverId), eq(autoRoleBlacklist.roleId, role.id)))
        .limit(1);

      if (existing.length > 0) {
        return message.reply(`❌ ${role} đã có trong blacklist rồi!`);
      }

      await db.insert(autoRoleBlacklist).values({
        serverId: serverId,
        roleId: role.id,
        reason: reason,
        addedBy: message.author.id
      });

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        roleId: role.id,
        action: 'blacklist_add',
        module: 'auto_roles',
        details: { reason: reason },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('🚫 Role Blacklisted')
        .setDescription(`${role} đã được thêm vào blacklist.\nLý do: ${reason}`)
        .setColor(0xED4245)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // Remove from blacklist
    if (action === 'remove') {
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

      if (!role) {
        return message.reply('❌ Vui lòng mention role hoặc cung cấp ID role!');
      }

      const deleted = await db.delete(autoRoleBlacklist)
        .where(and(eq(autoRoleBlacklist.serverId, serverId), eq(autoRoleBlacklist.roleId, role.id)))
        .returning();

      if (deleted.length === 0) {
        return message.reply(`❌ ${role} không có trong blacklist!`);
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        roleId: role.id,
        action: 'blacklist_remove',
        module: 'auto_roles',
        details: {},
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Role Unblacklisted')
        .setDescription(`${role} đã được xóa khỏi blacklist.`)
        .setColor(0x57F287)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    return message.reply('❌ Dùng: `!autoroles blacklist add/remove/list @role [lý do]`');
  }

  // Show current config
  const config = await db.select().from(autoRolesConfig).where(eq(autoRolesConfig.serverId, serverId)).limit(1);
  
  if (config.length === 0) {
    return message.reply('❌ Chưa có cấu hình auto roles! Dùng `!autoroles on` để bật.');
  }

  const cfg = config[0];
  const joinRoles = cfg.joinRoleIds && cfg.joinRoleIds.length > 0
    ? cfg.joinRoleIds.map(id => `<@&${id}>`).join(', ')
    : 'Chưa thiết lập';

  // Get blacklist count
  const blacklistCount = await db.select().from(autoRoleBlacklist).where(eq(autoRoleBlacklist.serverId, serverId));

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Cấu hình Auto Roles')
    .setColor(cfg.enabled ? 0x57F287 : 0xED4245)
    .addFields(
      { name: 'Trạng thái', value: cfg.enabled ? '✅ Đang bật' : '❌ Đang tắt', inline: true },
      { name: 'Reassign Roles', value: cfg.enableReassign ? '✅ Đang bật' : '❌ Đang tắt', inline: true },
      { name: 'Blacklist', value: `${blacklistCount.length} role(s)`, inline: true },
      { name: 'Join Roles', value: joinRoles, inline: false }
    )
    .setFooter({ text: 'Commands: join, reassign, blacklist' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

module.exports = {
  handleAutoRoles
};
