const { PermissionFlagsBits } = require('discord.js');

// Track infractions per user per server (in-memory cache)
const infractions = new Map(); // serverId -> userId -> count

// Get infraction count for a user
function getInfractionCount(serverId, userId) {
  if (!infractions.has(serverId)) {
    infractions.set(serverId, new Map());
  }
  return infractions.get(serverId).get(userId) || 0;
}

// Increment infraction count
function incrementInfractions(serverId, userId) {
  if (!infractions.has(serverId)) {
    infractions.set(serverId, new Map());
  }
  const serverInfractions = infractions.get(serverId);
  const current = serverInfractions.get(userId) || 0;
  serverInfractions.set(userId, current + 1);
  return current + 1;
}

// Reset infractions for a user
function resetInfractions(serverId, userId) {
  if (infractions.has(serverId)) {
    infractions.get(serverId).delete(userId);
  }
}

// Check auto ban rules and apply action
async function checkAutoBan(message, db) {
  if (!message.guild || message.author.bot) return false;
  
  const serverId = message.guild.id;
  const userId = message.author.id;
  
  try {
    const { autoBanRules } = await import('../database/schema.js');
    const { eq, and } = await import('drizzle-orm');
    
    // Load auto ban rules for this server
    const rules = await db.select()
      .from(autoBanRules)
      .where(and(
        eq(autoBanRules.serverId, serverId),
        eq(autoBanRules.enabled, true)
      ));
    
    if (rules.length === 0) return false;
    
    // Check each rule
    for (const rule of rules) {
      let violated = false;
      
      // Check rule type (support both old and new naming)
      switch (rule.ruleType) {
        case 'spam':
          // Spam is already handled by auto mod, but if it passed through...
          // We can increment infractions here
          violated = false; // Auto mod handles this
          break;
          
        case 'link':
        case 'links':
          // Check if message contains links
          const linkRegex = /(https?:\/\/[^\s]+)/gi;
          if (linkRegex.test(message.content)) {
            violated = true;
          }
          break;
          
        case 'invite':
        case 'invites':
          // Check Discord invite links
          const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/gi;
          if (inviteRegex.test(message.content)) {
            violated = true;
          }
          break;
          
        case 'mentions':
          // Check mention count
          const mentionCount = message.mentions.users.size + message.mentions.roles.size;
          if (mentionCount >= (rule.threshold || 5)) {
            violated = true;
          }
          break;
          
        case 'caps':
          // Check caps percentage
          const text = message.content.replace(/\s/g, '');
          if (text.length > 10) {
            const caps = text.replace(/[^A-Z]/g, '').length;
            const percentage = (caps / text.length) * 100;
            if (percentage >= (rule.threshold || 70)) {
              violated = true;
            }
          }
          break;
          
        case 'keyword':
        case 'banned_words':
          // Check banned words (stored in rule.bannedWords or use a default list)
          if (rule.bannedWords && Array.isArray(rule.bannedWords)) {
            const lowerContent = message.content.toLowerCase();
            for (const word of rule.bannedWords) {
              if (lowerContent.includes(word.toLowerCase())) {
                violated = true;
                break;
              }
            }
          }
          break;
          
        case 'newaccount':
        case 'new_account':
          // Check account age (accounts created within last 7 days)
          const accountAge = Date.now() - message.author.createdTimestamp;
          const daysOld = accountAge / (1000 * 60 * 60 * 24);
          if (daysOld < (rule.threshold || 7)) {
            violated = true;
          }
          break;
      }
      
      // If rule violated, increment infractions
      if (violated) {
        const count = incrementInfractions(serverId, userId);
        
        console.log(`⚠️ User ${message.author.tag} violated ${rule.ruleType} rule. Infractions: ${count}/${rule.maxInfractions}`);
        
        // Check if max infractions reached
        if (count >= rule.maxInfractions) {
          try {
            // Apply action
            const member = message.guild.members.cache.get(userId);
            if (!member) continue;
            
            // Check if bot has permissions
            const botMember = message.guild.members.cache.get(message.client.user.id);
            if (!botMember) continue;
            
            const reason = `Auto-ban: ${count} infractions (${rule.ruleType})`;
            
            switch (rule.actionType) {
              case 'warn':
                await message.reply(`⚠️ **Cảnh báo**: Bạn đã vi phạm ${count} lần. Tiếp tục vi phạm có thể bị kick/ban!`);
                break;
                
              case 'mute':
                if (botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                  await member.timeout(10 * 60 * 1000, reason); // 10 minutes
                  await message.channel.send(`🔇 ${message.author} đã bị mute 10 phút vì vi phạm quá nhiều.`);
                }
                break;
                
              case 'kick':
                if (botMember.permissions.has(PermissionFlagsBits.KickMembers) && 
                    member.kickable) {
                  await member.kick(reason);
                  await message.channel.send(`👢 ${message.author.tag} đã bị kick vì vi phạm ${count} lần.`);
                  resetInfractions(serverId, userId);
                }
                break;
                
              case 'ban':
                if (botMember.permissions.has(PermissionFlagsBits.BanMembers) && 
                    member.bannable) {
                  await member.ban({ reason, deleteMessageSeconds: 86400 }); // Delete 1 day of messages
                  await message.channel.send(`🔨 ${message.author.tag} đã bị ban vì vi phạm ${count} lần.`);
                  resetInfractions(serverId, userId);
                }
                break;
            }
            
            return true; // Action was taken
          } catch (error) {
            console.error('❌ Failed to apply auto-ban action:', error);
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error in checkAutoBan:', error);
    return false;
  }
}

// Check auto ban rules when member joins
async function checkMemberJoinAutoban(member, db) {
  if (member.user.bot) return null;
  
  const serverId = member.guild.id;
  
  try {
    const { autoBanRules } = await import('../database/schema.js');
    const { eq, and } = await import('drizzle-orm');
    
    const rules = await db.select()
      .from(autoBanRules)
      .where(and(
        eq(autoBanRules.serverId, serverId),
        eq(autoBanRules.enabled, true)
      ));
    
    if (rules.length === 0) return null;
    
    for (const rule of rules) {
      const violation = await checkMemberRule(member, rule);
      
      if (violation) {
        return {
          shouldBan: true,
          reason: rule.banReason || violation.reason,
          ruleType: rule.ruleType,
          ruleName: rule.ruleName
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`[AutoBan] Error checking member join rules:`, error);
    return null;
  }
}

async function checkMemberRule(member, rule) {
  switch (rule.ruleType) {
    case 'no_avatar':
      return checkNoAvatar(member);
    
    case 'account_age':
      return checkAccountAge(member, rule.threshold);
    
    case 'username_pattern':
      return checkUsernamePattern(member, rule.keywords);
    
    case 'invite_username':
      return checkInviteInUsername(member);
    
    default:
      return null;
  }
}

function checkNoAvatar(member) {
  const hasDefaultAvatar = member.user.avatar === null;
  
  if (hasDefaultAvatar) {
    return {
      violated: true,
      reason: 'No custom avatar detected'
    };
  }
  
  return null;
}

function checkAccountAge(member, minAgeDays) {
  if (!minAgeDays || minAgeDays <= 0) return null;
  
  const accountAge = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
  
  if (accountAge < minAgeDays) {
    return {
      violated: true,
      reason: `Account too new (${accountAge} days, required: ${minAgeDays} days)`
    };
  }
  
  return null;
}

function checkUsernamePattern(member, patterns) {
  if (!patterns || patterns.length === 0) return null;
  
  const username = member.user.username.toLowerCase();
  const displayName = member.user.displayName?.toLowerCase() || '';
  
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.toLowerCase());
      
      if (regex.test(username) || regex.test(displayName)) {
        return {
          violated: true,
          reason: `Username matches banned pattern: "${pattern}"`
        };
      }
    } catch (error) {
      console.error(`[AutoBan] Invalid regex pattern: ${pattern}`, error);
    }
  }
  
  return null;
}

function checkInviteInUsername(member) {
  const username = member.user.username.toLowerCase();
  const displayName = member.user.displayName?.toLowerCase() || '';
  
  const invitePatterns = [
    /discord\.gg\/\w+/i,
    /discordapp\.com\/invite\/\w+/i,
    /discord\.com\/invite\/\w+/i,
    /dsc\.gg\/\w+/i
  ];
  
  for (const pattern of invitePatterns) {
    if (pattern.test(username) || pattern.test(displayName)) {
      return {
        violated: true,
        reason: 'Username contains Discord invite link'
      };
    }
  }
  
  return null;
}

// Reset infractions on member leave
function onMemberLeave(serverId, userId) {
  resetInfractions(serverId, userId);
}

// Periodic cleanup of old infractions (call this every hour)
function cleanupInfractions() {
  // For now, we keep infractions in memory
  // In production, you might want to persist to database with timestamps
  // and clean up entries older than X hours
  console.log('🧹 Cleaned up old infractions');
}

module.exports = {
  checkAutoBan,
  checkMemberJoinAutoban,
  onMemberLeave,
  cleanupInfractions,
  getInfractionCount,
  resetInfractions
};
