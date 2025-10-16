const { eq, and } = require('drizzle-orm');

async function handleMemberJoin(member, db) {
  const { autoRolesConfig, autoRoleReassignTracking, autoRoleBlacklist } = require('../database/schema');

  const config = await db.select()
    .from(autoRolesConfig)
    .where(eq(autoRolesConfig.serverId, member.guild.id))
    .limit(1);

  if (config.length === 0 || !config[0].enabled) return;

  const cfg = config[0];
  const assignedRoles = [];

  // 1. Check if member should have roles reassigned (returning member)
  if (cfg.enableReassign) {
    const { roleAuditLogs } = require('../database/schema');
    
    const tracked = await db.select()
      .from(autoRoleReassignTracking)
      .where(and(
        eq(autoRoleReassignTracking.serverId, member.guild.id),
        eq(autoRoleReassignTracking.userId, member.id)
      ))
      .limit(1);

    if (tracked.length > 0) {
      const trackedEntry = tracked[0];
      const roleIds = trackedEntry.roleIds || [];

      // Get blacklisted roles
      const blacklisted = await db.select()
        .from(autoRoleBlacklist)
        .where(eq(autoRoleBlacklist.serverId, member.guild.id));
      
      const blacklistedIds = blacklisted.map(b => b.roleId);

      const failedRoles = []; // Track failed assignments

      // Restore roles (excluding blacklisted ones)
      for (const roleId of roleIds) {
        if (blacklistedIds.includes(roleId)) {
          continue; // Skip blacklisted roles
        }

        try {
          const role = await member.guild.roles.fetch(roleId).catch(() => null);
          if (role) {
            await member.roles.add(role);
            assignedRoles.push(roleId);
            console.log(`✅ Reassigned role ${role.name} to ${member.user.tag}`);
          } else {
            failedRoles.push(roleId); // Role doesn't exist anymore
          }
        } catch (error) {
          console.error(`Failed to reassign role ${roleId} to ${member.user.tag}:`, error);
          failedRoles.push(roleId); // Keep for retry on next join
        }
      }

      // Only delete tracking if ALL roles successfully restored OR all remaining are blacklisted
      const eligibleRoles = roleIds.filter(id => !blacklistedIds.includes(id));
      if (failedRoles.length === 0 || eligibleRoles.length === assignedRoles.length) {
        await db.delete(autoRoleReassignTracking)
          .where(and(
            eq(autoRoleReassignTracking.serverId, member.guild.id),
            eq(autoRoleReassignTracking.userId, member.id)
          ));
        console.log(`✅ Tracking removed - all roles processed for ${member.user.tag}`);
      } else {
        // Update tracking with only failed roles for retry
        await db.update(autoRoleReassignTracking)
          .set({ 
            roleIds: failedRoles,
            leftAt: new Date() // Reset timer for retry
          })
          .where(and(
            eq(autoRoleReassignTracking.serverId, member.guild.id),
            eq(autoRoleReassignTracking.userId, member.id)
          ));
        console.log(`⚠️ ${failedRoles.length} roles failed - kept for retry: ${failedRoles.join(', ')}`);
      }

      // Log reassignment event (always log, even if all failed - important for debugging)
      await db.insert(roleAuditLogs).values({
        serverId: member.guild.id,
        userId: member.id,
        action: 'reassign_roles',
        module: 'auto_roles',
        details: {
          rolesRestored: assignedRoles,
          rolesFailed: failedRoles,
          totalTracked: roleIds.length,
          success: assignedRoles.length > 0
        },
        performedBy: 'system'
      }).catch(err => console.error('Failed to log reassignment:', err));

      console.log(`🔄 Reassigned ${assignedRoles.length}/${eligibleRoles.length} roles to returning member ${member.user.tag}`);
    }
  }

  // 2. Add join roles (for all new members)
  if (cfg.joinRoleIds && cfg.joinRoleIds.length > 0) {
    for (const roleId of cfg.joinRoleIds) {
      // Skip if already assigned during reassignment
      if (assignedRoles.includes(roleId)) {
        continue;
      }

      try {
        const role = await member.guild.roles.fetch(roleId).catch(() => null);
        if (role) {
          await member.roles.add(role);
          console.log(`➕ Added join role ${role.name} to ${member.user.tag}`);
        }
      } catch (error) {
        console.error(`Failed to add role ${roleId} to ${member.user.tag}:`, error);
      }
    }
  }
}

async function handleMemberLeave(member, db) {
  const { autoRolesConfig, autoRoleReassignTracking, roleAuditLogs } = require('../database/schema');

  const config = await db.select()
    .from(autoRolesConfig)
    .where(eq(autoRolesConfig.serverId, member.guild.id))
    .limit(1);

  if (config.length === 0 || !config[0].enabled || !config[0].enableReassign) {
    return; // Reassign not enabled
  }

  // Track member's roles for reassignment
  const memberRoles = member.roles.cache
    .filter(role => role.id !== member.guild.id) // Exclude @everyone
    .map(role => role.id);

  if (memberRoles.length === 0) {
    return; // No roles to track
  }

  try {
    // Check if already tracked (update if exists)
    const existing = await db.select()
      .from(autoRoleReassignTracking)
      .where(and(
        eq(autoRoleReassignTracking.serverId, member.guild.id),
        eq(autoRoleReassignTracking.userId, member.id)
      ))
      .limit(1);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (existing.length > 0) {
      // Update existing entry
      await db.update(autoRoleReassignTracking)
        .set({
          roleIds: memberRoles,
          leftAt: new Date(),
          expiresAt: expiresAt
        })
        .where(and(
          eq(autoRoleReassignTracking.serverId, member.guild.id),
          eq(autoRoleReassignTracking.userId, member.id)
        ));
    } else {
      // Insert new entry
      await db.insert(autoRoleReassignTracking).values({
        serverId: member.guild.id,
        userId: member.id,
        roleIds: memberRoles,
        leftAt: new Date(),
        expiresAt: expiresAt
      });
    }

    // Log tracking event
    await db.insert(roleAuditLogs).values({
      serverId: member.guild.id,
      userId: member.id,
      action: 'track_roles',
      module: 'auto_roles',
      details: {
        roleIds: memberRoles,
        roleCount: memberRoles.length,
        expiresAt: expiresAt.toISOString()
      },
      performedBy: 'system'
    }).catch(err => console.error('Failed to log tracking:', err));

    console.log(`📝 Tracked ${memberRoles.length} roles for ${member.user.tag} (expires in 30 days)`);
  } catch (error) {
    console.error(`Failed to track roles for ${member.user.tag}:`, error);
  }
}

module.exports = {
  handleMemberJoin,
  handleMemberLeave
};
