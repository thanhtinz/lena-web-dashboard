const { db } = require('../database/db');
const { timedRoles, timedRoleQueue, roleAuditLogs, autoRoleBlacklist } = require('../database/schema');
const { eq, and } = require('drizzle-orm');

async function handleMemberJoin(member) {
  try {
    // Get all enabled timed roles for this server
    const serverTimedRoles = await db.select()
      .from(timedRoles)
      .where(and(
        eq(timedRoles.serverId, member.guild.id),
        eq(timedRoles.enabled, true)
      ));

    if (serverTimedRoles.length === 0) {
      return; // No timed roles configured
    }

    // Get blacklist to filter out blacklisted roles
    const blacklist = await db.select()
      .from(autoRoleBlacklist)
      .where(eq(autoRoleBlacklist.serverId, member.guild.id));
    
    const blacklistedRoleIds = new Set(blacklist.map(b => b.roleId));

    console.log(`⏰ Queueing ${serverTimedRoles.length} timed role(s) for ${member.user.tag} in ${member.guild.name}`);

    for (const timedRole of serverTimedRoles) {
      // Skip blacklisted roles
      if (blacklistedRoleIds.has(timedRole.roleId)) {
        console.log(`⚠️ Skipping blacklisted role ${timedRole.roleId} for ${member.user.tag}`);
        continue;
      }

      // Check if role still exists
      const role = await member.guild.roles.fetch(timedRole.roleId).catch(() => null);
      if (!role) {
        console.log(`⚠️ Role ${timedRole.roleId} not found, skipping`);
        continue;
      }

      // Calculate scheduled time
      const scheduledFor = new Date(Date.now() + timedRole.delayMinutes * 60 * 1000);

      // Add to queue
      try {
        await db.insert(timedRoleQueue).values({
          serverId: member.guild.id,
          userId: member.id,
          roleId: timedRole.roleId,
          timedRoleId: timedRole.id,
          scheduledFor: scheduledFor,
          status: 'pending'
        });

        console.log(`✅ Queued role ${role.name} for ${member.user.tag} (will assign in ${timedRole.delayMinutes}m)`);

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: member.guild.id,
          userId: member.id,
          action: 'timed_role_queue',
          module: 'timed_roles',
          details: {
            roleId: timedRole.roleId,
            roleName: role.name,
            delayMinutes: timedRole.delayMinutes,
            scheduledFor: scheduledFor.toISOString()
          },
          performedBy: 'system'
        }).catch(err => console.error('Failed to log timed role queue:', err));
      } catch (error) {
        console.error(`Failed to queue role ${role.name} for ${member.user.tag}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error handling timed roles for ${member.user.tag}:`, error);
  }
}

module.exports = {
  handleMemberJoin
};
