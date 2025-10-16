const cron = require('node-cron');
const { db } = require('../database/db');
const { timedRoleQueue, roleAuditLogs } = require('../database/schema');
const { lte, eq } = require('drizzle-orm');

let client = null;
let schedulerTask = null;

function initTimedRolesScheduler(discordClient) {
  client = discordClient;

  // Run every 1 minute to check for queued role assignments
  schedulerTask = cron.schedule('* * * * *', async () => {
    await processQueuedRoles();
  });

  console.log('⏰ Timed Roles Queue Scheduler initialized (checks every 1 minute)');
}

async function processQueuedRoles() {
  try {
    const now = new Date();

    // Get all queued roles that are ready to be assigned
    const queuedRoles = await db.select()
      .from(timedRoleQueue)
      .where(lte(timedRoleQueue.scheduledFor, now));

    if (queuedRoles.length === 0) {
      return;
    }

    console.log(`📋 Processing ${queuedRoles.length} queued timed role assignment(s)...`);

    for (const queuedRole of queuedRoles) {
      try {
        const guild = await client.guilds.fetch(queuedRole.serverId).catch(() => null);
        if (!guild) {
          // Guild not found, remove from queue
          await db.delete(timedRoleQueue).where(eq(timedRoleQueue.id, queuedRole.id));
          console.log(`⚠️ Guild ${queuedRole.serverId} not found, removed from queue`);
          continue;
        }

        const member = await guild.members.fetch(queuedRole.userId).catch(() => null);
        if (!member) {
          // Member left server, remove from queue
          await db.delete(timedRoleQueue).where(eq(timedRoleQueue.id, queuedRole.id));
          console.log(`⚠️ Member ${queuedRole.userId} not found, removed from queue`);
          continue;
        }

        const role = await guild.roles.fetch(queuedRole.roleId).catch(() => null);
        if (!role) {
          // Role deleted, remove from queue
          await db.delete(timedRoleQueue).where(eq(timedRoleQueue.id, queuedRole.id));
          console.log(`⚠️ Role ${queuedRole.roleId} not found, removed from queue`);
          continue;
        }

        // Check if member already has the role
        if (member.roles.cache.has(role.id)) {
          await db.delete(timedRoleQueue).where(eq(timedRoleQueue.id, queuedRole.id));
          console.log(`⚠️ Member ${member.user.tag} already has role ${role.name}, skipped`);
          continue;
        }

        // Add role to member
        await member.roles.add(role);

        // Mark as processed in queue
        await db.update(timedRoleQueue)
          .set({
            status: 'completed',
            processedAt: now
          })
          .where(eq(timedRoleQueue.id, queuedRole.id));

        // Log action
        await db.insert(roleAuditLogs).values({
          serverId: queuedRole.serverId,
          userId: queuedRole.userId,
          action: 'timed_role_assign',
          module: 'timed_roles',
          details: {
            roleId: queuedRole.roleId,
            roleName: role.name,
            timedRoleId: queuedRole.timedRoleId,
            scheduledFor: queuedRole.scheduledFor.toISOString()
          },
          performedBy: 'system'
        }).catch(err => console.error('Failed to log timed role assignment:', err));

        console.log(`✅ Assigned timed role ${role.name} to ${member.user.tag} in ${guild.name}`);

        // Send DM notification to user
        try {
          await member.send({
            embeds: [{
              color: 0x10b981,
              title: '⏰ New Role Assigned',
              description: `You've been assigned the role **${role.name}** in **${guild.name}** based on timed role settings.`,
              fields: [
                { name: 'Role', value: role.name, inline: true },
                { name: 'Server', value: guild.name, inline: true }
              ],
              timestamp: new Date().toISOString()
            }]
          });
          console.log(`📧 Sent role assignment notification to ${member.user.tag}`);
        } catch (dmError) {
          console.log(`⚠️ Could not send DM to ${member.user.tag} (DMs disabled or blocked)`);
        }
      } catch (error) {
        console.error(`Failed to process queued role ${queuedRole.id}:`, error);
        
        // Mark as failed
        await db.update(timedRoleQueue)
          .set({ status: 'failed' })
          .where(eq(timedRoleQueue.id, queuedRole.id))
          .catch(err => console.error('Failed to mark queue item as failed:', err));
      }
    }

    // Clean up completed/failed queue items older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await db.delete(timedRoleQueue)
      .where(lte(timedRoleQueue.processedAt, sevenDaysAgo))
      .catch(err => console.error('Failed to clean up old queue items:', err));

    console.log(`⏰ Processed ${queuedRoles.length} queued role assignment(s)`);
  } catch (error) {
    console.error('Error processing queued timed roles:', error);
  }
}

function stopTimedRolesScheduler() {
  if (schedulerTask) {
    schedulerTask.stop();
    console.log('⏰ Timed Roles Queue Scheduler stopped');
  }
}

module.exports = {
  initTimedRolesScheduler,
  processQueuedRoles,
  stopTimedRolesScheduler
};
