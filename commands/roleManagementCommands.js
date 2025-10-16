const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Wave 4: Role Management Commands
 * Comprehensive role CRUD and manipulation system similar to Carl-bot
 * Commands: create, delete, color, edit, info, add, remove, removeall, all, humans, bots, in, rall
 */

async function handleRoleManagement(message, args, db) {
  const { roleAuditLogs } = require('../database/schema');
  
  const subcommand = args[0]?.toLowerCase();
  const serverId = message.guild.id;

  // Helper function for permission check (skips for read-only commands)
  const requireManageRoles = () => {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply('❌ Bạn cần quyền **Manage Roles** để sử dụng lệnh này!');
    }
    return null;
  };

  // Role Create Command
  if (subcommand === 'create') {
    const permError = requireManageRoles();
    if (permError) return permError;
    const roleName = args.slice(1).join(' ').split('|')[0]?.trim();
    const options = args.slice(1).join(' ').split('|').slice(1).join('|').trim();
    
    if (!roleName) {
      return message.reply('❌ Dùng: `!role create <tên role> [| color=<màu>] [| hoist=yes/no] [| mentionable=yes/no]`\n' +
        'Ví dụ: `!role create VIP | color=#FFD700 | hoist=yes`');
    }

    try {
      // Parse options
      const colorMatch = options.match(/color\s*=\s*([#\w]+)/i);
      const hoistMatch = options.match(/hoist\s*=\s*(yes|no)/i);
      const mentionableMatch = options.match(/mentionable\s*=\s*(yes|no)/i);

      const roleData = {
        name: roleName,
        color: colorMatch ? colorMatch[1] : null,
        hoist: hoistMatch ? hoistMatch[1].toLowerCase() === 'yes' : false,
        mentionable: mentionableMatch ? mentionableMatch[1].toLowerCase() === 'yes' : false,
        reason: `Created by ${message.author.tag}`
      };

      const role = await message.guild.roles.create(roleData);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_create',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, color: roleData.color, hoist: roleData.hoist, mentionable: roleData.mentionable },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Role đã được tạo')
        .setDescription(`Role ${role} đã được tạo thành công!`)
        .addFields(
          { name: '📛 Tên', value: role.name, inline: true },
          { name: '🎨 Màu', value: role.hexColor || 'Default', inline: true },
          { name: '📌 Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
          { name: '🔔 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
        )
        .setColor(role.color || 0x5865F2)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role create error:', error);
      return message.reply(`❌ Lỗi khi tạo role: ${error.message}`);
    }
  }

  // Role Delete Command
  if (subcommand === 'delete') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role delete @role` hoặc `!role delete <role_id>`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể xóa role này vì nó cao hơn role của bot!');
    }

    if (role.position >= message.member.roles.highest.position && message.guild.ownerId !== message.author.id) {
      return message.reply('❌ Không thể xóa role cao hơn role của bạn!');
    }

    try {
      const roleName = role.name;
      const roleId = role.id;
      
      await role.delete(`Deleted by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_delete',
        module: 'role_management',
        targetRoleId: roleId,
        details: { roleName: roleName },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Role đã được xóa')
        .setDescription(`Role **${roleName}** đã được xóa thành công!`)
        .setColor(0xED4245)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role delete error:', error);
      return message.reply(`❌ Lỗi khi xóa role: ${error.message}`);
    }
  }

  // Role Color Command
  if (subcommand === 'color') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    const color = args[2];
    
    if (!role || !color) {
      return message.reply('❌ Dùng: `!role color @role <màu>`\n' +
        'Màu có thể là: HEX (#FF0000), tên màu (Red), hoặc số (16711680)');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể chỉnh sửa role này vì nó cao hơn role của bot!');
    }

    try {
      const oldColor = role.hexColor;
      await role.setColor(color, `Color changed by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_color_change',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, oldColor: oldColor, newColor: role.hexColor },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('🎨 Màu role đã được thay đổi')
        .setDescription(`Màu của ${role} đã được thay đổi!`)
        .addFields(
          { name: 'Màu cũ', value: oldColor || 'Default', inline: true },
          { name: 'Màu mới', value: role.hexColor, inline: true }
        )
        .setColor(role.color)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role color error:', error);
      return message.reply(`❌ Lỗi khi đổi màu role: ${error.message}`);
    }
  }

  // Role Edit Command
  if (subcommand === 'edit') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    const property = args[2]?.toLowerCase();
    const value = args.slice(3).join(' ');
    
    if (!role || !property || !value) {
      return message.reply('❌ Dùng: `!role edit @role <property> <value>`\n' +
        'Properties: `name`, `hoist`, `mentionable`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể chỉnh sửa role này vì nó cao hơn role của bot!');
    }

    try {
      const changes = {};
      
      if (property === 'name') {
        changes.name = value;
      } else if (property === 'hoist') {
        const hoistValue = value.toLowerCase();
        if (hoistValue !== 'yes' && hoistValue !== 'no') {
          return message.reply('❌ Giá trị hoist phải là `yes` hoặc `no`');
        }
        changes.hoist = hoistValue === 'yes';
      } else if (property === 'mentionable') {
        const mentionValue = value.toLowerCase();
        if (mentionValue !== 'yes' && mentionValue !== 'no') {
          return message.reply('❌ Giá trị mentionable phải là `yes` hoặc `no`');
        }
        changes.mentionable = mentionValue === 'yes';
      } else {
        return message.reply('❌ Property không hợp lệ! Dùng: `name`, `hoist`, hoặc `mentionable`');
      }

      await role.edit(changes, `Edited by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_edit',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, property: property, newValue: value },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✏️ Role đã được chỉnh sửa')
        .setDescription(`${role} đã được cập nhật!`)
        .addFields({ name: `${property.charAt(0).toUpperCase() + property.slice(1)} mới`, value: String(value) })
        .setColor(role.color || 0x5865F2)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role edit error:', error);
      return message.reply(`❌ Lỗi khi chỉnh sửa role: ${error.message}`);
    }
  }

  // Role Info Command (read-only, no permission required)
  if (subcommand === 'info') {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role info @role` hoặc `!role info <role_id>`');
    }

    const memberCount = message.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;
    const permissions = role.permissions.toArray().slice(0, 10).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`📋 Thông tin Role: ${role.name}`)
      .addFields(
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Màu', value: role.hexColor, inline: true },
        { name: '📍 Vị trí', value: String(role.position), inline: true },
        { name: '👥 Thành viên', value: String(memberCount), inline: true },
        { name: '📌 Hoist', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: '🔔 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: '🔑 Permissions', value: permissions }
      )
      .setColor(role.color || 0x5865F2)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

  // Role Add to User Command
  if (subcommand === 'add') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const targetUser = message.mentions.members.first() || 
                       await message.guild.members.fetch(args[1]).catch(() => null);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
    
    if (!targetUser || !role) {
      return message.reply('❌ Dùng: `!role add @user @role`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gán role này vì nó cao hơn role của bot!');
    }

    if (targetUser.roles.cache.has(role.id)) {
      return message.reply(`❌ ${targetUser} đã có role ${role} rồi!`);
    }

    try {
      await targetUser.roles.add(role, `Added by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_add_user',
        module: 'role_management',
        targetUserId: targetUser.id,
        targetRoleId: role.id,
        details: { userName: targetUser.user.tag, roleName: role.name },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Role đã được gán')
        .setDescription(`${role} đã được gán cho ${targetUser}!`)
        .setColor(0x57F287)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role add error:', error);
      return message.reply(`❌ Lỗi khi gán role: ${error.message}`);
    }
  }

  // Role Remove from User Command
  if (subcommand === 'remove') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const targetUser = message.mentions.members.first() || 
                       await message.guild.members.fetch(args[1]).catch(() => null);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
    
    if (!targetUser || !role) {
      return message.reply('❌ Dùng: `!role remove @user @role`');
    }

    if (!targetUser.roles.cache.has(role.id)) {
      return message.reply(`❌ ${targetUser} không có role ${role}!`);
    }

    try {
      await targetUser.roles.remove(role, `Removed by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_remove_user',
        module: 'role_management',
        targetUserId: targetUser.id,
        targetRoleId: role.id,
        details: { userName: targetUser.user.tag, roleName: role.name },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('➖ Role đã được gỡ')
        .setDescription(`${role} đã được gỡ khỏi ${targetUser}!`)
        .setColor(0xED4245)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role remove error:', error);
      return message.reply(`❌ Lỗi khi gỡ role: ${error.message}`);
    }
  }

  // Remove All Roles from User Command
  if (subcommand === 'removeall') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const targetUser = message.mentions.members.first() || 
                       await message.guild.members.fetch(args[1]).catch(() => null);
    
    if (!targetUser) {
      return message.reply('❌ Dùng: `!role removeall @user`');
    }

    try {
      const removableRoles = targetUser.roles.cache.filter(r => 
        r.id !== message.guild.id && // Skip @everyone
        r.position < message.guild.members.me.roles.highest.position
      );

      if (removableRoles.size === 0) {
        return message.reply(`❌ ${targetUser} không có role nào để gỡ!`);
      }

      await targetUser.roles.remove(removableRoles, `All roles removed by ${message.author.tag}`);

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_removeall_user',
        module: 'role_management',
        targetUserId: targetUser.id,
        details: { userName: targetUser.user.tag, rolesRemoved: removableRoles.size },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Tất cả role đã được gỡ')
        .setDescription(`Đã gỡ ${removableRoles.size} role(s) khỏi ${targetUser}!`)
        .setColor(0xED4245)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Role removeall error:', error);
      return message.reply(`❌ Lỗi khi gỡ roles: ${error.message}`);
    }
  }

  // Bulk: Give Role to All Members
  if (subcommand === 'all') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role all @role`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gán role này vì nó cao hơn role của bot!');
    }

    try {
      // Fetch ALL members (not just cached)
      const members = await message.guild.members.fetch();
      const eligibleMembers = members.filter(m => !m.roles.cache.has(role.id));

      if (eligibleMembers.size === 0) {
        return message.reply('❌ Tất cả thành viên đã có role này rồi!');
      }

      const statusMsg = await message.reply(`⏳ Đang gán ${role} cho ${eligibleMembers.size} thành viên...`);

      let success = 0;
      let failed = 0;

      for (const [, member] of eligibleMembers) {
        try {
          await member.roles.add(role, `Bulk role assignment by ${message.author.tag}`);
          success++;
        } catch {
          failed++;
        }
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_bulk_all',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, success: success, failed: failed },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Bulk Role Assignment - Tất cả')
        .setDescription(`${role} đã được gán hàng loạt!`)
        .addFields(
          { name: '✅ Thành công', value: String(success), inline: true },
          { name: '❌ Thất bại', value: String(failed), inline: true }
        )
        .setColor(0x57F287)
        .setTimestamp();

      await statusMsg.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Role all error:', error);
      return message.reply(`❌ Lỗi: ${error.message}`);
    }
  }

  // Bulk: Give Role to All Humans
  if (subcommand === 'humans') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role humans @role`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gán role này vì nó cao hơn role của bot!');
    }

    try {
      // Fetch ALL members (not just cached)
      const members = await message.guild.members.fetch();
      const eligibleMembers = members.filter(m => !m.user.bot && !m.roles.cache.has(role.id));

      if (eligibleMembers.size === 0) {
        return message.reply('❌ Tất cả người dùng đã có role này rồi!');
      }

      const statusMsg = await message.reply(`⏳ Đang gán ${role} cho ${eligibleMembers.size} người dùng...`);

      let success = 0;
      let failed = 0;

      for (const [, member] of eligibleMembers) {
        try {
          await member.roles.add(role, `Bulk humans role assignment by ${message.author.tag}`);
          success++;
        } catch {
          failed++;
        }
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_bulk_humans',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, success: success, failed: failed },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Bulk Role Assignment - Humans')
        .setDescription(`${role} đã được gán cho tất cả người dùng!`)
        .addFields(
          { name: '✅ Thành công', value: String(success), inline: true },
          { name: '❌ Thất bại', value: String(failed), inline: true }
        )
        .setColor(0x57F287)
        .setTimestamp();

      await statusMsg.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Role humans error:', error);
      return message.reply(`❌ Lỗi: ${error.message}`);
    }
  }

  // Bulk: Give Role to All Bots
  if (subcommand === 'bots') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role bots @role`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gán role này vì nó cao hơn role của bot!');
    }

    try {
      // Fetch ALL members (not just cached)
      const members = await message.guild.members.fetch();
      const eligibleMembers = members.filter(m => m.user.bot && !m.roles.cache.has(role.id));

      if (eligibleMembers.size === 0) {
        return message.reply('❌ Tất cả bot đã có role này rồi!');
      }

      const statusMsg = await message.reply(`⏳ Đang gán ${role} cho ${eligibleMembers.size} bot(s)...`);

      let success = 0;
      let failed = 0;

      for (const [, member] of eligibleMembers) {
        try {
          await member.roles.add(role, `Bulk bots role assignment by ${message.author.tag}`);
          success++;
        } catch {
          failed++;
        }
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_bulk_bots',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, success: success, failed: failed },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Bulk Role Assignment - Bots')
        .setDescription(`${role} đã được gán cho tất cả bot!`)
        .addFields(
          { name: '✅ Thành công', value: String(success), inline: true },
          { name: '❌ Thất bại', value: String(failed), inline: true }
        )
        .setColor(0x57F287)
        .setTimestamp();

      await statusMsg.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Role bots error:', error);
      return message.reply(`❌ Lỗi: ${error.message}`);
    }
  }

  // Bulk: Give role2 to members with role1
  if (subcommand === 'in') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role1 = message.mentions.roles.first();
    const role2 = message.mentions.roles.size > 1 ? 
                  Array.from(message.mentions.roles.values())[1] : 
                  message.guild.roles.cache.get(args[2]);
    
    if (!role1 || !role2) {
      return message.reply('❌ Dùng: `!role in @role1 @role2`\nGán role2 cho tất cả thành viên có role1');
    }

    if (role2.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gán role2 vì nó cao hơn role của bot!');
    }

    try {
      // Fetch ALL members (not just cached)
      const members = await message.guild.members.fetch();
      const eligibleMembers = members.filter(m => 
        m.roles.cache.has(role1.id) && !m.roles.cache.has(role2.id)
      );

      if (eligibleMembers.size === 0) {
        return message.reply(`❌ Không có thành viên nào có ${role1} mà chưa có ${role2}!`);
      }

      const statusMsg = await message.reply(`⏳ Đang gán ${role2} cho ${eligibleMembers.size} thành viên có ${role1}...`);

      let success = 0;
      let failed = 0;

      for (const [, member] of eligibleMembers) {
        try {
          await member.roles.add(role2, `Bulk 'in' role assignment by ${message.author.tag}`);
          success++;
        } catch {
          failed++;
        }
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_bulk_in',
        module: 'role_management',
        targetRoleId: role2.id,
        details: { 
          sourceRoleName: role1.name, 
          targetRoleName: role2.name, 
          success: success, 
          failed: failed 
        },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ Bulk Role Assignment - In')
        .setDescription(`${role2} đã được gán cho thành viên có ${role1}!`)
        .addFields(
          { name: '✅ Thành công', value: String(success), inline: true },
          { name: '❌ Thất bại', value: String(failed), inline: true }
        )
        .setColor(0x57F287)
        .setTimestamp();

      await statusMsg.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Role in error:', error);
      return message.reply(`❌ Lỗi: ${error.message}`);
    }
  }

  // Bulk: Remove role from all members
  if (subcommand === 'rall') {
    const permError = requireManageRoles();
    if (permError) return permError;
    
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    
    if (!role) {
      return message.reply('❌ Dùng: `!role rall @role`');
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply('❌ Không thể gỡ role này vì nó cao hơn role của bot!');
    }

    try {
      // Fetch ALL members (not just cached)
      const members = await message.guild.members.fetch();
      const eligibleMembers = members.filter(m => m.roles.cache.has(role.id));

      if (eligibleMembers.size === 0) {
        return message.reply('❌ Không có thành viên nào có role này!');
      }

      const statusMsg = await message.reply(`⏳ Đang gỡ ${role} khỏi ${eligibleMembers.size} thành viên...`);

      let success = 0;
      let failed = 0;

      for (const [, member] of eligibleMembers) {
        try {
          await member.roles.remove(role, `Bulk role removal by ${message.author.tag}`);
          success++;
        } catch {
          failed++;
        }
      }

      // Log action
      await db.insert(roleAuditLogs).values({
        serverId: serverId,
        action: 'role_bulk_removeall',
        module: 'role_management',
        targetRoleId: role.id,
        details: { roleName: role.name, success: success, failed: failed },
        performedBy: message.author.id
      });

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Bulk Role Removal')
        .setDescription(`${role} đã được gỡ hàng loạt!`)
        .addFields(
          { name: '✅ Thành công', value: String(success), inline: true },
          { name: '❌ Thất bại', value: String(failed), inline: true }
        )
        .setColor(0xED4245)
        .setTimestamp();

      await statusMsg.edit({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Role rall error:', error);
      return message.reply(`❌ Lỗi: ${error.message}`);
    }
  }

  // Help/Usage
  const helpEmbed = new EmbedBuilder()
    .setTitle('🎭 Role Management Commands')
    .setDescription('Hệ thống quản lý role toàn diện')
    .addFields(
      { 
        name: '📝 Role CRUD', 
        value: '`!role create <tên> [| color=<màu>] [| hoist=yes/no]`\n' +
               '`!role delete @role`\n' +
               '`!role color @role <màu>`\n' +
               '`!role edit @role <property> <value>`\n' +
               '`!role info @role`'
      },
      { 
        name: '👤 Member Operations', 
        value: '`!role add @user @role`\n' +
               '`!role remove @user @role`\n' +
               '`!role removeall @user`'
      },
      { 
        name: '🔄 Bulk Operations', 
        value: '`!role all @role` - Gán cho tất cả\n' +
               '`!role humans @role` - Gán cho người dùng\n' +
               '`!role bots @role` - Gán cho bot\n' +
               '`!role in @role1 @role2` - Gán role2 cho ai có role1\n' +
               '`!role rall @role` - Gỡ khỏi tất cả'
      }
    )
    .setColor(0x5865F2)
    .setTimestamp();

  return message.reply({ embeds: [helpEmbed] });
}

module.exports = { handleRoleManagement };
