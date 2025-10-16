const { pgTable, text, serial, timestamp, boolean, integer, varchar, jsonb } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

// Server Configurations - Cấu hình cho từng server (prefix, mode, channels, etc)
const serverConfigs = pgTable('server_configs', {
  id: varchar('id', { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar('server_id', { length: 100 }).notNull().unique(),
  prefix: varchar('prefix', { length: 10 }).default('!'),
  personalityMode: varchar('personality_mode', { length: 50 }).default('lena'),
  language: varchar('language', { length: 10 }),
  allowedChannels: jsonb('allowed_channels').default([]),
  autoReact: boolean('auto_react').default(true),
  contentFilter: boolean('content_filter').default(true),
  customBlacklist: jsonb('custom_blacklist').default([]),
  blacklistEnabled: boolean('blacklist_enabled').default(true),
  keywords: jsonb('keywords').default({}),
  isPremium: boolean('is_premium').default(false),
  premiumExpiry: timestamp('premium_expiry'),
  premiumPlanId: varchar('premium_plan_id', { length: 255 }),
  premiumOwnerId: varchar('premium_owner_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Training data table - Admin có thể thêm Q&A để train bot
const trainingData = pgTable('training_data', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Conversation logs table - Lưu lịch sử hội thoại để analyze
const conversationLogs = pgTable('conversation_logs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  userId: text('user_id').notNull(),
  userMessage: text('user_message').notNull(),
  botResponse: text('bot_response').notNull(),
  personalityMode: text('personality_mode'),
  timestamp: timestamp('timestamp').defaultNow()
});

// Custom responses table - Admin tạo responses tùy chỉnh
const customResponses = pgTable('custom_responses', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  trigger: text('trigger').notNull(),
  response: text('response').notNull(),
  embedName: text('embed_name'),                // Tên embed để gửi (optional, nếu có thì gửi embed)
  isExactMatch: boolean('is_exact_match').default(false),
  priority: integer('priority').default(0),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Conversation history table - Lưu từng message riêng lẻ trong 7 ngày (tối ưu storage)
const conversationHistory = pgTable('conversation_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),        // Discord user ID
  channelId: text('channel_id').notNull(),  // Discord channel ID
  serverId: text('server_id'),              // Discord server ID (null for DMs)
  role: text('role').notNull(),             // 'user' or 'assistant' (không lưu system)
  content: text('content').notNull(),       // Message content
  createdAt: timestamp('created_at').defaultNow()
});

// Confession system - Config cho từng server
const confessionConfigs = pgTable('confession_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  channelId: text('channel_id'),            // Kênh gửi confession threads
  buttonLabel: text('button_label').default('📝 Gửi Confession'),
  replyButtonLabel: text('reply_button_label').default('💬 Trả lời'),
  isActive: boolean('is_active').default(true),
  requireReplyApproval: boolean('require_reply_approval').default(false),  // Require admin approval for replies
  logConfessions: boolean('log_confessions').default(false),  // Premium: Log confession authors
  logChannelId: text('log_channel_id'),     // Premium: Discord channel to log OR null for web-only
  logToWeb: boolean('log_to_web').default(true),  // Premium: Log to web dashboard (default)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Confessions table - Lưu confession entries
const confessions = pgTable('confessions', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),        // Anonymous to others, but tracked
  username: text('username'),               // User's tag for logging
  threadId: text('thread_id'),              // Discord thread ID
  threadUrl: text('thread_url'),            // Thread URL for easy access
  content: text('content').notNull(),
  status: text('status').default('active'), // active, deleted, hidden
  createdAt: timestamp('created_at').defaultNow()
});

// Confession replies - Lưu replies với moderation
const confessionReplies = pgTable('confession_replies', {
  id: serial('id').primaryKey(),
  confessionId: integer('confession_id').notNull(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  isModerated: boolean('is_moderated').default(false),
  moderatedBy: text('moderated_by'),
  status: text('status').default('pending'), // pending, approved, rejected
  isPosted: boolean('is_posted').default(false), // Whether reply has been posted to Discord
  createdAt: timestamp('created_at').defaultNow(),
  moderatedAt: timestamp('moderated_at')
});

// Giveaways table - Lưu thông tin giveaway
const giveaways = pgTable('giveaways', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id'),                // Message ID của giveaway embed
  hostId: text('host_id').notNull(),            // User tạo giveaway
  prize: text('prize').notNull(),               // Phần thưởng
  winnerCount: integer('winner_count').default(1),
  requiredRole: text('required_role'),          // Role yêu cầu (optional)
  endTime: timestamp('end_time').notNull(),     // Thời gian kết thúc
  status: text('status').default('active'),     // active, ended, cancelled
  winners: text('winners'),                     // JSON array của winner IDs
  createdAt: timestamp('created_at').defaultNow()
});

// Giveaway participants - Người tham gia giveaway
const giveawayParticipants = pgTable('giveaway_participants', {
  id: serial('id').primaryKey(),
  giveawayId: integer('giveaway_id').notNull(),
  userId: text('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow()
});

// Giveaway blacklist - User bị cấm tham gia giveaway
const giveawayBlacklist = pgTable('giveaway_blacklist', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  blacklistedBy: text('blacklisted_by').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow()
});

// Moderation configs - Cấu hình moderation log channel cho từng server
const moderationConfigs = pgTable('moderation_configs', {
  id: serial('id').primaryKey(),
  serverId: varchar('server_id', { length: 100 }).notNull().unique(),
  enabled: boolean('enabled').default(true),
  
  // DM Settings
  dmOnKick: boolean('dm_on_kick').default(true),
  dmOnBan: boolean('dm_on_ban').default(true),
  dmOnMute: boolean('dm_on_mute').default(true),
  
  // Mute Settings
  useDiscordTimeout: boolean('use_discord_timeout').default(true), // Use new Discord timeout API
  muteRoleId: text('mute_role_id'),            // Role mute (optional, for old mute system)
  
  // Command Settings
  deleteModCommands: boolean('delete_mod_commands').default(false),
  respondWithReason: boolean('respond_with_reason').default(true),
  preserveMessagesOnBan: boolean('preserve_messages_on_ban').default(true), // Don't delete message history
  
  // Log Channel
  logChannelId: varchar('log_channel_id', { length: 100 }),
  
  // Event Logging Options
  logOptions: jsonb('log_options').default({
    logBans: true,
    logUnbans: true,
    logKicks: true,
    logMutes: true,
    logUnmutes: true,
    logWarns: true,
    logPurges: true,
    logLockdowns: true,
    logLocks: true,
    logUnlocks: true,
    logSlowmode: true,
    logRoleChanges: false,
    logChannelUpdates: false,
    logMemberJoin: false,
    logMemberLeave: false,
    logMessageDelete: false,
    logMessageEdit: false,
    logNicknameChange: false,
  }),
  
  // Roles
  moderatorRoles: jsonb('moderator_roles').default([]), // Roles có quyền mod
  protectedRoles: jsonb('protected_roles').default([]), // Roles không bị mod được
  
  // Lockdown
  lockdownChannels: jsonb('lockdown_channels').default([]), // Channels để lock
  
  // Custom Messages
  customMessages: jsonb('custom_messages').default({
    banMessage: 'You have been banned from {server} for: {reason}',
    unbanMessage: 'You have been unbanned from {server}',
    softbanMessage: 'You have been softbanned from {server} for: {reason}',
    kickMessage: 'You have been kicked from {server} for: {reason}',
    muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
    unmuteMessage: 'You have been unmuted in {server}',
  }),
  
  // Commands Enable/Disable
  commandsEnabled: jsonb('commands_enabled').default({
    ban: true,
    unban: true,
    kick: true,
    mute: true,
    unmute: true,
    warn: true,
    unwarn: true,
    lock: true,
    unlock: true,
    slowmode: true,
    purge: true,
    nuke: true
  }),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Warnings table - Lưu warnings cho users
const warnings = pgTable('warnings', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),           // User bị warn
  moderatorId: text('moderator_id').notNull(), // Moderator đã warn
  reason: text('reason'),
  status: text('status').default('active'),    // active, removed
  createdAt: timestamp('created_at').defaultNow(),
  removedAt: timestamp('removed_at'),
  removedBy: text('removed_by')
});

// Custom Embeds - Lưu embed templates để tái sử dụng
const customEmbeds = pgTable('custom_embeds', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  name: text('name').notNull(),                 // Tên embed để tìm kiếm
  title: text('title'),
  description: text('description'),
  color: text('color'),                         // Hex color (e.g., "#FF0000")
  authorName: text('author_name'),
  authorIcon: text('author_icon'),
  footerText: text('footer_text'),
  footerIcon: text('footer_icon'),
  imageUrl: text('image_url'),
  thumbnailUrl: text('thumbnail_url'),
  fields: text('fields'),                       // JSON array [{name, value, inline}]
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Welcome Message Config - Auto welcome khi user join
const welcomeConfigs = pgTable('welcome_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  channelId: text('channel_id'),                // Channel gửi welcome message
  message: text('message'),                     // Message với variables {user}, {server_name}, etc.
  embedName: text('embed_name'),                // Tên embed (optional, từ customEmbeds)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Leave Message Config - Auto message khi user rời server
const leaveConfigs = pgTable('leave_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  channelId: text('channel_id'),                // Channel gửi leave message
  message: text('message'),                     // Message với variables
  embedName: text('embed_name'),                // Tên embed (optional)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Boost Message Config - Auto message khi user boost server
const boostConfigs = pgTable('boost_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  channelId: text('channel_id'),                // Channel gửi boost message
  message: text('message'),                     // Message với variables
  embedName: text('embed_name'),                // Tên embed (optional)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Global Settings - System-wide configuration
const settings = pgTable('settings', {
  id: text('id').primaryKey().default('global'),
  topggApiKey: text('topgg_api_key'),
  topggWebhookAuth: text('topgg_webhook_auth'),
  topggAutoPost: boolean('topgg_auto_post').default(false),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Action Logs Config - Cấu hình log types và channels
const actionLogsConfig = pgTable('action_logs_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  logChannelId: text('log_channel_id'),
  
  // Display Settings
  showAvatar: boolean('show_avatar').default(true),
  showAccountAge: boolean('show_account_age').default(true),
  
  // Ignore Settings
  ignoredChannels: jsonb('ignored_channels').default([]),
  ignoredRoles: jsonb('ignored_roles').default([]),
  
  // Message Events
  enableMessageDelete: boolean('enable_message_delete').default(true),
  enableMessageEdit: boolean('enable_message_edit').default(true),
  enableImageDelete: boolean('enable_image_delete').default(true),
  enableBulkDelete: boolean('enable_bulk_delete').default(true),
  enableInviteLog: boolean('enable_invite_log').default(false),
  enableModeratorCommands: boolean('enable_moderator_commands').default(false),
  
  // Member Events
  enableMemberJoin: boolean('enable_member_join').default(true),
  enableMemberLeave: boolean('enable_member_leave').default(true),
  enableMemberRoleAdd: boolean('enable_member_role_add').default(false),
  enableMemberRoleRemove: boolean('enable_member_role_remove').default(false),
  enableMemberTimeout: boolean('enable_member_timeout').default(true),
  enableNicknameChange: boolean('enable_nickname_change').default(false),
  enableMemberBan: boolean('enable_member_ban').default(true),
  enableMemberUnban: boolean('enable_member_unban').default(true),
  enableMemberKick: boolean('enable_member_kick').default(true),
  enableMemberUpdate: boolean('enable_member_update').default(false),
  
  // Role Events
  enableRoleCreate: boolean('enable_role_create').default(false),
  enableRoleDelete: boolean('enable_role_delete').default(false),
  enableRoleUpdate: boolean('enable_role_update').default(false),
  
  // Channel Events
  enableChannelCreate: boolean('enable_channel_create').default(false),
  enableChannelUpdate: boolean('enable_channel_update').default(false),
  enableChannelDelete: boolean('enable_channel_delete').default(false),
  
  // Emoji Events
  enableEmojiCreate: boolean('enable_emoji_create').default(false),
  enableEmojiUpdate: boolean('enable_emoji_update').default(false),
  enableEmojiDelete: boolean('enable_emoji_delete').default(false),
  
  // Voice Events
  enableVoiceJoin: boolean('enable_voice_join').default(false),
  enableVoiceLeave: boolean('enable_voice_leave').default(false),
  enableVoiceMove: boolean('enable_voice_move').default(false),
  
  // Server Events
  enableServerUpdate: boolean('enable_server_update').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto Delete Config - Cấu hình tự động xóa tin nhắn
const autoDeleteConfig = pgTable('auto_delete_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(false),
  channelIds: jsonb('channel_ids').default([]),
  deleteAfterSeconds: integer('delete_after_seconds').default(60),
  whitelistRoleIds: jsonb('whitelist_role_ids').default([]),
  whitelistUserIds: jsonb('whitelist_user_ids').default([]),
  deleteCommands: boolean('delete_commands').default(true),
  deleteBotReplies: boolean('delete_bot_replies').default(true),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Scheduled Messages - Tin nhắn tự động theo lịch
const scheduledMessages = pgTable('scheduled_messages', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  message: text('message'),
  embedName: text('embed_name'),
  cronExpression: text('cron_expression').notNull(),
  enabled: boolean('enabled').default(true),
  lastSent: timestamp('last_sent'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto Ban Rules - Rules cho auto ban khi user join server
// Rule types: 'no_avatar', 'account_age', 'username_pattern', 'invite_username'
const autoBanRules = pgTable('auto_ban_rules', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(true),
  ruleName: text('rule_name'),
  ruleType: text('rule_type').notNull(),
  banReason: text('ban_reason').default('Violated auto-ban rules'),
  threshold: integer('threshold').default(1),
  keywords: jsonb('keywords').default([]),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto Mod Config - Cấu hình auto moderation
const autoModConfig = pgTable('auto_mod_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(false),
  antiSpam: boolean('anti_spam').default(true),
  spamThreshold: integer('spam_threshold').default(5),
  spamTimeWindow: integer('spam_time_window').default(5),
  antiLinks: boolean('anti_links').default(false),
  whitelistedDomains: jsonb('whitelisted_domains').default([]),
  antiInvites: boolean('anti_invites').default(false),
  antiCaps: boolean('anti_caps').default(false),
  capsPercentage: integer('caps_percentage').default(70),
  antiMentionSpam: boolean('anti_mention_spam').default(true),
  mentionThreshold: integer('mention_threshold').default(5),
  bannedWords: jsonb('banned_words').default([]),
  actionType: text('action_type').default('warn'),
  ignoredChannels: jsonb('ignored_channels').default([]),
  ignoredRoles: jsonb('ignored_roles').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto Roles Config - Cấu hình auto roles
const autoRolesConfig = pgTable('auto_roles_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  enabled: boolean('enabled').default(false),
  joinRoleIds: jsonb('join_role_ids').default([]),
  enableReassign: boolean('enable_reassign').default(false), // Track and reassign roles when members rejoin
  reactionRoles: jsonb('reaction_roles').default([]),
  levelRoles: jsonb('level_roles').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Auto Role Reassign Tracking - Track members who left to restore roles when they rejoin
const autoRoleReassignTracking = pgTable('auto_role_reassign_tracking', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleIds: jsonb('role_ids').notNull(),
  leftAt: timestamp('left_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Auto Role Blacklist - Prevent specific roles from being reassigned
const autoRoleBlacklist = pgTable('auto_role_blacklist', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  reason: text('reason'),
  addedBy: text('added_by').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Timed Roles - Roles assigned after a delay when members join
const timedRoles = pgTable('timed_roles', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  delayMinutes: integer('delay_minutes').notNull(),
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Timed Role Queue - Track pending timed role assignments
const timedRoleQueue = pgTable('timed_role_queue', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  timedRoleId: integer('timed_role_id').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status: text('status').default('pending'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Messages - Master table for reaction role messages
const reactionRoleMessages = pgTable('reaction_role_messages', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id').notNull().unique(),
  messageType: text('message_type').default('normal'),
  maxRolesPerUser: integer('max_roles_per_user'),
  selfDestruct: boolean('self_destruct').default(false),
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Options - Emoji to Role mappings
const reactionRoleOptions = pgTable('reaction_role_options', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  emoji: text('emoji').notNull(),
  roleId: text('role_id').notNull(),
  maxAssignments: integer('max_assignments'),
  currentAssignments: integer('current_assignments').default(0),
  tempDurationMinutes: integer('temp_duration_minutes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Groups - Link emojis for unique/limit constraints
const reactionRoleGroups = pgTable('reaction_role_groups', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  groupName: text('group_name').notNull(),
  groupType: text('group_type').default('unique'),
  maxRoles: integer('max_roles').default(1),
  emojiIds: jsonb('emoji_ids').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Whitelist - Roles allowed to react
const reactionRoleWhitelist = pgTable('reaction_role_whitelist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Blacklist - Roles prevented from reacting
const reactionRoleBlacklist = pgTable('reaction_role_blacklist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Reaction Role Assignments - Track assignments for analytics
const reactionRoleAssignments = pgTable('reaction_role_assignments', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  optionId: integer('option_id').notNull(),
  roleId: text('role_id').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
  expiresAt: timestamp('expires_at')
});

// Temp Roles - Temporary role assignments with auto-removal
const tempRoles = pgTable('temp_roles', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  reason: text('reason'),
  assignedBy: text('assigned_by').notNull(),
  status: text('status').default('active'),
  removedAt: timestamp('removed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Role Audit Logs - Comprehensive audit trail
const roleAuditLogs = pgTable('role_audit_logs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id'),
  roleId: text('role_id'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  details: jsonb('details'),
  performedBy: text('performed_by').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

// Custom Commands - Custom commands do user tạo (premium)
const customCommands = pgTable('custom_commands', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  commandName: text('command_name').notNull(),
  description: text('description'),
  response: text('response'),
  
  // Basic Options
  enabled: boolean('enabled').default(true),
  deleteCommand: boolean('delete_command').default(false),      // Delete trigger message
  silentCommand: boolean('silent_command').default(false),      // Silent response
  dmResponse: boolean('dm_response').default(false),            // Send via DM
  disableMentions: boolean('disable_mentions').default(false),  // Disable @everyone, @here, role pings
  
  // Permissions
  allowedRoles: jsonb('allowed_roles').default([]),             // Roles that can use
  ignoredRoles: jsonb('ignored_roles').default([]),             // Roles that can't use
  allowedChannels: jsonb('allowed_channels').default([]),       // Channels where it works
  ignoredChannels: jsonb('ignored_channels').default([]),       // Channels where it doesn't work
  responseChannel: text('response_channel'),                    // Specific channel to respond in
  
  // Advanced Options
  cooldownSeconds: integer('cooldown_seconds').default(0),      // Cooldown between uses
  deleteAfter: integer('delete_after').default(0),              // Auto-delete response after X seconds
  requiredArguments: integer('required_arguments').default(0),  // Minimum args required
  
  // Additional Responses & Embeds
  additionalResponses: jsonb('additional_responses').default([]), // Array of extra responses
  embedConfig: jsonb('embed_config'),                           // Embed configuration
  
  // Stats & Meta
  useCount: integer('use_count').default(0),
  isPremium: boolean('is_premium').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Shard Metrics - Store real-time metrics from ShardManager
const shardMetrics = pgTable('shard_metrics', {
  id: serial('id').primaryKey(),
  shardId: integer('shard_id').notNull(),
  clusterId: integer('cluster_id').notNull(),
  servers: integer('servers').default(0),
  cachedUsers: integer('cached_users').default(0),
  latency: integer('latency').default(0),           // in milliseconds
  uptime: text('uptime'),                           // formatted string
  memUsage: integer('mem_usage').default(0),        // in bytes
  status: text('status').default('online'),         // online, offline, degraded
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Bot Command Categories - Auto-synced from bot code
const botCommandCategories = pgTable('bot_command_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nameVi: text('name_vi').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 50 }),
  sortOrder: integer('sort_order').default(0),
  lastSyncedAt: timestamp('last_synced_at').defaultNow()
});

// Bot Commands - Auto-synced from bot code
const botCommands = pgTable('bot_commands', {
  id: serial('id').primaryKey(),
  categorySlug: varchar('category_slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  nameVi: text('name_vi'),
  nameEn: text('name_en'),
  descriptionVi: text('description_vi').notNull(),
  descriptionEn: text('description_en').notNull(),
  usage: text('usage').notNull(),
  usageVi: text('usage_vi'),
  usageEn: text('usage_en'),
  aliases: jsonb('aliases').default([]),
  permissions: text('permissions'),
  isPremium: boolean('is_premium').default(false),
  isSlashCommand: boolean('is_slash_command').default(false),
  sortOrder: integer('sort_order').default(0),
  lastSyncedAt: timestamp('last_synced_at').defaultNow()
});

module.exports = {
  serverConfigs,
  trainingData,
  conversationLogs,
  customResponses,
  conversationHistory,
  confessionConfigs,
  confessions,
  confessionReplies,
  giveaways,
  giveawayParticipants,
  giveawayBlacklist,
  moderationConfigs,
  warnings,
  customEmbeds,
  welcomeConfigs,
  leaveConfigs,
  boostConfigs,
  settings,
  actionLogsConfig,
  autoDeleteConfig,
  scheduledMessages,
  autoBanRules,
  autoModConfig,
  autoRolesConfig,
  autoRoleReassignTracking,
  autoRoleBlacklist,
  tempRoles,
  timedRoles,
  timedRoleQueue,
  reactionRoleMessages,
  reactionRoleOptions,
  reactionRoleGroups,
  reactionRoleWhitelist,
  reactionRoleBlacklist,
  reactionRoleAssignments,
  roleAuditLogs,
  customCommands,
  shardMetrics,
  botCommands,
  botCommandCategories
};
