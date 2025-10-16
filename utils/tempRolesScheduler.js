const cron = require('node-cron');
const { db } = require('../database/db');
const { tempRoles, roleAuditLogs } = require('../database/schema');
const { lte, eq, and } = require('drizzle-orm');

let client = null;
let schedulerTask = null;

function initTempRolesScheduler(discordClient) {
  client = discordClient;

  // Run every 1 minute to check for expired roles
  schedulerTask = cron.schedule('* * * * *', async () => {
    await processExpiredRoles();
  });

  console.log('⏰ Temporary Roles Scheduler initialized (checks every 1 minute)');
}

async function processExpiredRoles() {
  try {
    const now = new Date();

    // Get all expired temporary roles
    const expiredRoles = await db.select()
      .from(tempRoles)
      .where(lte(tempRoles.expiresAt, now));

    if (expiredRoles.length === 0) {
      return; // No expired roles
    }

    console.log(`⏰ Processing ${expiredRoles.length} expired temporary role(s)...`);

    for (const tempRole of expiredRoles) {
      try {
        const guild = await client.guilds.fetch(tempRole.serverId).catch(() => null);
        if (!guild) {
          // Guild not found, delete from database
          await db.delete(tempRoles)
            .where(and(
              eq(tempRoles.serverId, tempRole.serverId),
              eq(tempRoles.userId, tempRole.userId),
              eq(tempRoles.roleId, tempRole.roleId)
            ));
          console.log(`⚠️ Guild ${tempRole.serverId} not found, removed temp role from DB`);
          continue;
        }

        const member = await guild.members.fetch(tempRole.userId).catch(() => null);
        if (!member) {
          // Member left server, delete from database
          await db.delete(tempRoles)
            .where(and(
              eq(tempRoles.serverId, tempRole.serverId),
              eq(tempRoles.userId, tempRole.userId),
              eq(tempRoles.roleId, tempRole.roleId)
            ));
          console.log(`⚠️ Member ${tempRole.userId} not found, removed temp role from DB`);
          continue;
        }

        const role = await guild.roles.fetch(tempRole.roleId).catch(() => null);
        if (!role) {
          // Role deleted, delete from database
          await db.delete(tempRoles)
            .where(and(
              eq(tempRoles.serverId, tempRole.serverId),
              eq(tempRoles.userId, tempRole.userId),
              eq(tempRoles.roleId, tempRole.roleId)
            ));
          console.log(`⚠️ Role ${tempRole.roleId} not found, removed temp role from DB`);
          continue;
        }

        // Remove role from member
        await member.roles.remove(role);

        // Delete from database
        await db.delete(tempRoles)
          .where(and(
            eq(tempRoles.serverId, tempRole.serverId),
            eq(tempRoles.userId, tempRole.userId),
            eq(tempRoles.roleId, tempRole.roleId)
          ));

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: tempRole.serverId,
          userId: tempRole.userId,
          action: 'temp_role_expire',
          module: 'temp_roles',
          details: {
            roleId: tempRole.roleId,
            roleName: role.name,
            expiresAt: tempRole.expiresAt.toISOString(),
            reason: tempRole.reason
          },
          performedBy: 'system'
        }).catch(err => console.error('Failed to log temp role expiry:', err));

        // Send DM notification to user
        try {
          await member.send({
            embeds: [{
              color: 0xef4444,
              title: '⏰ Temporary Role Expired',
              description: `Your temporary role **${role.name}** in **${guild.name}** has expired and been removed.`,
              fields: [
                { name: 'Role', value: role.name, inline: true },
                { name: 'Server', value: guild.name, inline: true },
                { name: 'Reason', value: tempRole.reason || 'No reason provided', inline: false }
              ],
              timestamp: new Date().toISOString()
            }]
          });
          console.log(`📧 Sent expiry notification to ${member.user.tag}`);
        } catch (dmError) {
          console.log(`⚠️ Could not send DM to ${member.user.tag} (DMs disabled or blocked)`);
        }

        console.log(`✅ Removed expired role ${role.name} from ${member.user.tag} in ${guild.name}`);
      } catch (error) {
        console.error(`Failed to process expired temp role for user ${tempRole.userId}:`, error);
      }
    }

    console.log(`⏰ Processed ${expiredRoles.length} expired temporary role(s)`);
  } catch (error) {
    console.error('Error processing expired temporary roles:', error);
  }
}

function stopTempRolesScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    console.log('⏰ Temporary Roles Scheduler stopped');
  }
}

module.exports = {
  initTempRolesScheduler,
  processExpiredRoles,
  stopTempRolesScheduler
};
