import { pgTable, varchar, text, integer, boolean, timestamp, jsonb, serial, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Pricing Plans
export const pricingPlans = pgTable('pricing_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  badge: varchar('badge', { length: 50 }),
  description: text('description'),
  priceUsd: integer('price_usd').notNull(),
  priceVnd: integer('price_vnd').notNull(),
  billingCycle: varchar('billing_cycle', { length: 20 }).notNull(),
  trialDays: integer('trial_days').default(0),
  features: jsonb('features').$type<string[]>().notNull(),
  limits: jsonb('limits').$type<{
    maxServers?: number;              // Số server tối đa được dùng bot
    maxCustomBots?: number;            // Số bot custom được tạo
    maxGiveawaysPerMonth?: number;     // Số giveaway/tháng
    maxCustomCommands?: number;        // Số lệnh custom
    maxCustomResponses?: number;       // Số auto-response custom
    maxEmbeds?: number;                // Số embed custom
    storageMb?: number;                // Storage limit
    dailyApiCalls?: number;            // API calls/ngày
    concurrentConversations?: number;  // Số cuộc hội thoại đồng thời
  }>(),
  allowedCommands: jsonb('allowed_commands').$type<string[]>().default([]), // Danh sách lệnh được phép
  allowedFeatures: jsonb('allowed_features').$type<string[]>().default([]), // Danh sách tính năng được phép
  restrictions: jsonb('restrictions').$type<{
    canUseAI?: boolean;
    canUseGames?: boolean;
    canUseModeration?: boolean;
    canUseGiveaways?: boolean;
    canUseCustomBots?: boolean;
    canUseWebSearch?: boolean;
    canUseImageAnalysis?: boolean;
  }>().default({
    canUseAI: true,
    canUseGames: true,
    canUseModeration: false,
    canUseGiveaways: false,
    canUseCustomBots: false,
    canUseWebSearch: true,
    canUseImageAnalysis: false,
  }),
  isVisible: boolean('is_visible').default(true),
  isActive: boolean('is_active').default(true),
  targetRegion: varchar('target_region', { length: 20 }).default('all'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Subscriptions (Match actual database)
export const subscriptions = pgTable('subscriptions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 100 }).notNull(),
  planId: varchar('plan_id'),
  status: varchar('status', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Feature Flags (Match actual database)
export const featureFlags = pgTable('feature_flags', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  enabled: boolean('enabled').default(true),
  rolloutPercentage: integer('rollout_percentage').default(100),
  targetingRules: jsonb('targeting_rules').$type<{
    subscriptionTier?: string[];
    serverSize?: { min?: number; max?: number };
    region?: string[];
    botInstances?: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bot Instances (Match actual database)
export const botInstances = pgTable('bot_instances', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  tokenEncrypted: varchar('token_encrypted', { length: 255 }),
  clientId: varchar('client_id', { length: 100 }),
  status: varchar('status', { length: 20 }).default('offline'),
  config: jsonb('config').$type<{
    prefix?: string;
    personalityMode?: string;
    customAvatar?: string;
    customName?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Custom Bot Instances (Premium Feature - similar to Dyno)
export const customBots = pgTable('custom_bots', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 100 }).notNull(),
  serverId: varchar('server_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  botToken: varchar('bot_token', { length: 255 }).notNull(),
  clientId: varchar('client_id', { length: 100 }).notNull(),
  apiKey: varchar('api_key', { length: 100 }).notNull(), // For bot process authentication
  status: varchar('status', { length: 20 }).default('offline'),
  config: jsonb('config').$type<{
    prefix?: string;
    personalityMode?: string;
    statusMessage?: string;
    enabledFeatures?: string[];
    intents?: number[];
    permissions?: string[];
    webhookUrl?: string;
  }>(),
  metrics: jsonb('metrics').$type<{
    ping?: number;
    uptime?: number;
    memoryUsage?: number;
    guildCount?: number;
    userCount?: number;
    lastHeartbeat?: string;
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Bot Analytics
export const customBotAnalytics = pgTable('custom_bot_analytics', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar('bot_id', { length: 100 }).notNull(),
  date: varchar('date', { length: 20 }).notNull(), // YYYY-MM-DD
  messageCount: integer('message_count').default(0),
  commandCount: integer('command_count').default(0),
  activeGuilds: integer('active_guilds').default(0),
  activeUsers: integer('active_users').default(0),
  errorCount: integer('error_count').default(0),
  uptimeMinutes: integer('uptime_minutes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Bot Logs
export const customBotLogs = pgTable('custom_bot_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar('bot_id', { length: 100 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(), // info, warn, error, debug
  message: text('message').notNull(),
  metadata: jsonb('metadata').$type<{
    guildId?: string;
    channelId?: string;
    userId?: string;
    command?: string;
    error?: string;
    [key: string]: any;
  }>(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Premium Custom Commands (Premium Feature)
export const premiumCommands = pgTable('premium_commands', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 100 }).notNull(),
  serverId: varchar('server_id', { length: 100 }).notNull(),
  customBotId: varchar('custom_bot_id', { length: 100 }),
  commandName: varchar('command_name', { length: 50 }).notNull(),
  description: text('description'),
  responseType: varchar('response_type', { length: 20 }).default('text'),
  responseContent: text('response_content').notNull(),
  embedData: jsonb('embed_data').$type<{
    title?: string;
    description?: string;
    color?: string;
    fields?: { name: string; value: string }[];
    footer?: string;
    thumbnail?: string;
    image?: string;
  }>(),
  permissions: jsonb('permissions').$type<{
    requiredRoles?: string[];
    allowedChannels?: string[];
    cooldown?: number;
  }>(),
  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Commands - Server-specific custom commands (Premium)
export const customCommands = pgTable('custom_commands', {
  id: serial('id').primaryKey(),
  serverId: varchar('server_id', { length: 100 }).notNull(),
  commandName: varchar('command_name', { length: 100 }).notNull(),
  description: text('description'),
  response: text('response'),
  
  // Basic Options
  enabled: boolean('enabled').default(true),
  deleteCommand: boolean('delete_command').default(false),       // Delete trigger message
  silentCommand: boolean('silent_command').default(false),       // Silent response
  dmResponse: boolean('dm_response').default(false),             // Send via DM
  disableMentions: boolean('disable_mentions').default(false),   // Disable @everyone, @here, role pings
  
  // Permissions
  allowedRoles: jsonb('allowed_roles').$type<string[]>().default(sql`'[]'::jsonb`),     // Roles that can use
  ignoredRoles: jsonb('ignored_roles').$type<string[]>().default(sql`'[]'::jsonb`),     // Roles that can't use
  allowedChannels: jsonb('allowed_channels').$type<string[]>().default(sql`'[]'::jsonb`), // Channels where it works
  ignoredChannels: jsonb('ignored_channels').$type<string[]>().default(sql`'[]'::jsonb`), // Channels where it doesn't work
  responseChannel: varchar('response_channel', { length: 100 }), // Specific channel to respond in
  
  // Advanced Options
  cooldownSeconds: integer('cooldown_seconds').default(0),       // Cooldown between uses
  deleteAfter: integer('delete_after').default(0),               // Auto-delete response after X seconds
  requiredArguments: integer('required_arguments').default(0),   // Minimum args required
  
  // Additional Responses & Embeds
  additionalResponses: jsonb('additional_responses').$type<Array<{
    content: string;
    weight?: number; // For random selection
  }>>().default(sql`'[]'::jsonb`),
  embedConfig: jsonb('embed_config').$type<{
    title?: string;
    description?: string;
    color?: string;
    footer?: { text?: string; iconUrl?: string };
    thumbnail?: string;
    image?: string;
    author?: { name?: string; iconUrl?: string; url?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }>(),
  
  // Stats & Meta
  useCount: integer('use_count').default(0),
  isPremium: boolean('is_premium').default(true),
  createdBy: varchar('created_by', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Admin Activity Logs
export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: varchar('admin_user_id', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }),
  targetId: varchar('target_id', { length: 100 }),
  details: jsonb('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Payment Transactions  
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  subscriptionId: varchar('subscription_id'),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  paymentProvider: varchar('payment_provider', { length: 20 }).notNull(),
  externalTransactionId: varchar('external_transaction_id', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conversation History - Lưu tin nhắn trong 7 ngày
export const conversationHistory = pgTable('conversation_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  channelId: text('channel_id').notNull(),
  serverId: text('server_id'),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conversation Logs - Log lại các cuộc hội thoại
export const conversationLogs = pgTable('conversation_logs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  userId: text('user_id').notNull(),
  userMessage: text('user_message').notNull(),
  botResponse: text('bot_response').notNull(),
  personalityMode: text('personality_mode'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Training Data - Admin tạo Q&A để train bot
export const trainingData = pgTable('training_data', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Server Configurations
export const serverConfigs = pgTable('server_configs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar('server_id', { length: 100 }).notNull().unique(),
  prefix: varchar('prefix', { length: 10 }).default('!'),
  personalityMode: varchar('personality_mode', { length: 50 }).default('lena'),
  language: varchar('language', { length: 10 }),
  allowedChannels: jsonb('allowed_channels').$type<string[]>().default([]),
  autoReact: boolean('auto_react').default(true),
  contentFilter: boolean('content_filter').default(true),
  isPremium: boolean('is_premium').default(false),
  premiumExpiry: timestamp('premium_expiry'),
  premiumPlanId: varchar('premium_plan_id', { length: 255 }),
  premiumOwnerId: varchar('premium_owner_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Giveaways
export const giveaways = pgTable('giveaways', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id'),
  hostId: text('host_id').notNull(),
  prize: text('prize').notNull(),
  winnerCount: integer('winner_count').default(1),
  requiredRole: text('required_role'),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('active'),
  winners: text('winners'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const giveawayParticipants = pgTable('giveaway_participants', {
  id: serial('id').primaryKey(),
  giveawayId: integer('giveaway_id').notNull(),
  userId: text('user_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Custom Embeds
export const customEmbeds = pgTable('custom_embeds', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  name: text('name').notNull(),
  title: text('title'),
  description: text('description'),
  color: text('color'),
  authorName: text('author_name'),
  authorIcon: text('author_icon'),
  footerText: text('footer_text'),
  footerIcon: text('footer_icon'),
  imageUrl: text('image_url'),
  thumbnailUrl: text('thumbnail_url'),
  fields: text('fields'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Custom Auto-Responses
export const customResponses = pgTable('custom_responses', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  trigger: text('trigger').notNull(),
  response: text('response').notNull(),
  embedName: text('embed_name'),
  isExactMatch: boolean('is_exact_match').default(false),
  priority: integer('priority').default(0),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Support Tickets
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }),
  subject: varchar('subject', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('open'),
  assignedTo: varchar('assigned_to', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// System Settings
export const settings = pgTable('settings', {
  id: varchar('id').primaryKey().default('global'),
  // Website Settings
  siteName: varchar('site_name', { length: 100 }).default('Lena Bot'),
  siteDescription: text('site_description'),
  siteLogo: varchar('site_logo', { length: 255 }),
  supportServerUrl: varchar('support_server_url', { length: 255 }),
  
  // Bot Settings
  defaultPrefix: varchar('default_prefix', { length: 10 }).default('!'),
  defaultPersonality: varchar('default_personality', { length: 50 }).default('lena'),
  statusMessages: jsonb('status_messages').$type<string[]>(),
  
  // Payment Settings
  paypalClientId: varchar('paypal_client_id', { length: 255 }),
  paypalClientSecret: varchar('paypal_client_secret', { length: 255 }),
  payosClientId: varchar('payos_client_id', { length: 255 }),
  payosApiKey: varchar('payos_api_key', { length: 255 }),
  payosChecksumKey: varchar('payos_checksum_key', { length: 255 }),
  
  // Top.gg Settings
  topggApiKey: varchar('topgg_api_key', { length: 255 }),
  topggWebhookAuth: varchar('topgg_webhook_auth', { length: 255 }),
  topggAutoPost: boolean('topgg_auto_post').default(false),
  
  // Advanced Settings
  rateLimitPerMinute: integer('rate_limit_per_minute').default(60),
  conversationHistoryDays: integer('conversation_history_days').default(7),
  maintenanceMode: boolean('maintenance_mode').default(false),
  
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: varchar('updated_by', { length: 100 }),
});

// Blog Posts
export const blogPosts = pgTable('blog_posts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: varchar('featured_image', { length: 500 }),
  authorId: varchar('author_id', { length: 100 }).notNull(),
  authorName: varchar('author_name', { length: 100 }),
  category: varchar('category', { length: 50 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  status: varchar('status', { length: 20 }).default('draft'),
  publishedAt: timestamp('published_at'),
  seo: jsonb('seo').$type<{
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  }>(),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Documentation Categories
export const docCategories = pgTable('doc_categories', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  orderIndex: integer('order_index').default(0),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Documentation Pages
export const docPages = pgTable('doc_pages', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar('category_id', { length: 100 }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  icon: varchar('icon', { length: 50 }),
  orderIndex: integer('order_index').default(0),
  isVisible: boolean('is_visible').default(true),
  isFeatured: boolean('is_featured').default(false),
  tags: jsonb('tags').$type<string[]>().default([]),
  seo: jsonb('seo').$type<{
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  }>(),
  authorId: varchar('author_id', { length: 100 }),
  authorName: varchar('author_name', { length: 100 }),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Confession Configuration
export const confessionConfigs = pgTable('confession_configs', {
  id: serial('id').primaryKey(),
  serverId: varchar('server_id', { length: 100 }).notNull().unique(),
  channelId: varchar('channel_id', { length: 100 }),
  buttonLabel: varchar('button_label', { length: 100 }).default('📝 Gửi Confession'),
  replyButtonLabel: varchar('reply_button_label', { length: 100 }).default('💬 Trả lời'),
  isActive: boolean('is_active').default(true),
  requireReplyApproval: boolean('require_reply_approval').default(false),  // Require admin approval for replies
  logConfessions: boolean('log_confessions').default(false),  // Premium: Log confession authors
  logChannelId: varchar('log_channel_id', { length: 100 }),   // Premium: Discord channel OR null for web-only
  logToWeb: boolean('log_to_web').default(true),              // Premium: Log to web dashboard (default)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Confessions
export const confessions = pgTable('confessions', {
  id: serial('id').primaryKey(),
  serverId: varchar('server_id', { length: 100 }).notNull(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }),
  threadId: varchar('thread_id', { length: 100 }),
  threadUrl: text('thread_url'),
  content: text('content').notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Confession Replies
export const confessionReplies = pgTable('confession_replies', {
  id: serial('id').primaryKey(),
  confessionId: integer('confession_id').notNull(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  content: text('content').notNull(),
  isModerated: boolean('is_moderated').default(false),
  moderatedBy: varchar('moderated_by', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'),
  isPosted: boolean('is_posted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  moderatedAt: timestamp('moderated_at'),
});

// Moderation Configuration
export const moderationConfigs = pgTable('moderation_configs', {
  id: serial('id').primaryKey(),
  serverId: varchar('server_id', { length: 100 }).notNull().unique(),
  enabled: boolean('enabled').default(true),
  
  // DM Settings
  dmOnKick: boolean('dm_on_kick').default(true),
  dmOnBan: boolean('dm_on_ban').default(true),
  dmOnMute: boolean('dm_on_mute').default(true),
  
  // Mute Settings
  useDiscordTimeout: boolean('use_discord_timeout').default(true), // Use new Discord timeout API
  
  // Command Settings
  deleteModCommands: boolean('delete_mod_commands').default(false),
  respondWithReason: boolean('respond_with_reason').default(true),
  preserveMessagesOnBan: boolean('preserve_messages_on_ban').default(true), // Don't delete message history
  
  // Log Channel
  logChannelId: varchar('log_channel_id', { length: 100 }),
  
  // Event Logging Options (only implemented actions)
  logOptions: jsonb('log_options').$type<{
    logBans?: boolean;
    logUnbans?: boolean;
    logKicks?: boolean;
    logMutes?: boolean;
    logUnmutes?: boolean;
    logWarns?: boolean;
  }>().default({
    logBans: true,
    logUnbans: true,
    logKicks: true,
    logMutes: true,
    logUnmutes: true,
    logWarns: true,
  }),
  
  // Roles
  moderatorRoles: jsonb('moderator_roles').$type<string[]>().default([]), // Roles có quyền mod
  protectedRoles: jsonb('protected_roles').$type<string[]>().default([]), // Roles không bị mod được
  
  // Lockdown
  lockdownChannels: jsonb('lockdown_channels').$type<string[]>().default([]), // Channels để lock
  
  // Custom Messages
  customMessages: jsonb('custom_messages').$type<{
    banMessage?: string;
    unbanMessage?: string;
    softbanMessage?: string;
    kickMessage?: string;
    muteMessage?: string;
    unmuteMessage?: string;
  }>().default({
    banMessage: 'You have been banned from {server} for: {reason}',
    unbanMessage: 'You have been unbanned from {server}',
    softbanMessage: 'You have been softbanned from {server} for: {reason}',
    kickMessage: 'You have been kicked from {server} for: {reason}',
    muteMessage: 'You have been muted in {server} for: {reason}. Duration: {duration}',
    unmuteMessage: 'You have been unmuted in {server}',
  }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Welcome System Configurations
export const welcomeConfigs = pgTable('welcome_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id'),
  message: text('message'),
  embedName: text('embed_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Leave System Configurations
export const leaveConfigs = pgTable('leave_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id'),
  message: text('message'),
  embedName: text('embed_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Boost System Configurations
export const boostConfigs = pgTable('boost_configs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id'),
  message: text('message'),
  embedName: text('embed_name'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Auto Ban Rules - Ban users on join based on conditions
export const autoBanRules = pgTable('auto_ban_rules', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  enabled: boolean('enabled').default(true),
  ruleName: text('rule_name'),
  ruleType: text('rule_type').notNull(), // no_avatar, account_age, username_pattern, invite_username
  banReason: text('ban_reason').default('Violated auto-ban rules'),
  threshold: integer('threshold').default(1), // For account_age: minimum days, for username_pattern: uses keywords array
  keywords: jsonb('keywords').$type<string[]>().default([]), // For username_pattern: regex patterns to match
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Scheduled Messages
export const scheduledMessages = pgTable('scheduled_messages', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  message: text('message'),
  embedName: text('embed_name'),
  cronExpression: text('cron_expression').notNull(), // Cron format: minute hour day month dayOfWeek
  enabled: boolean('enabled').default(true),
  lastSent: timestamp('last_sent'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================================
// ROLE MANAGEMENT SYSTEM TABLES
// =====================================================================

// Auto Roles Config - Enhanced with reassign feature
export const autoRolesConfig = pgTable('auto_roles_config', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull().unique(),
  enabled: boolean('enabled').default(false),
  joinRoleIds: jsonb('join_role_ids').$type<string[]>().default([]),
  enableReassign: boolean('enable_reassign').default(false),
  reactionRoles: jsonb('reaction_roles').default([]),
  levelRoles: jsonb('level_roles').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Auto Role Reassign Tracking - Track members who left to restore roles
export const autoRoleReassignTracking = pgTable('auto_role_reassign_tracking', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleIds: jsonb('role_ids').$type<string[]>().notNull(),
  leftAt: timestamp('left_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Auto Role Blacklist - Prevent specific roles from being reassigned
export const autoRoleBlacklist = pgTable('auto_role_blacklist', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  reason: text('reason'),
  addedBy: text('added_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Temporary Roles - Roles that auto-expire after a duration (moderation feature)
export const tempRoles = pgTable('temp_roles', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  addedBy: text('added_by').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Timed Roles - Roles assigned after a delay when members join
export const timedRoles = pgTable('timed_roles', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  delayMinutes: integer('delay_minutes').notNull(),
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Timed Role Queue - Track pending timed role assignments
export const timedRoleQueue = pgTable('timed_role_queue', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  timedRoleId: integer('timed_role_id').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status: text('status').default('pending'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Messages - Master table for reaction role messages
export const reactionRoleMessages = pgTable('reaction_role_messages', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageId: text('message_id').notNull().unique(),
  messageType: text('message_type').default('normal'),
  locked: boolean('locked').default(false),
  maxRolesPerUser: integer('max_roles_per_user'),
  tempDurationMinutes: integer('temp_duration_minutes'),
  selfDestruct: boolean('self_destruct').default(false),
  enabled: boolean('enabled').default(true),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Options - Emoji to Role mappings
export const reactionRoleOptions = pgTable('reaction_role_options', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  emoji: text('emoji').notNull(),
  roleId: text('role_id').notNull(),
  maxAssignments: integer('max_assignments'),
  currentAssignments: integer('current_assignments').default(0),
  tempDurationMinutes: integer('temp_duration_minutes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Groups - Link emojis for unique/limit constraints
export const reactionRoleGroups = pgTable('reaction_role_groups', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  groupName: text('group_name').notNull(),
  groupType: text('group_type').default('unique'),
  maxRoles: integer('max_roles').default(1),
  emojiIds: jsonb('emoji_ids').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Whitelist - Roles allowed to react
export const reactionRoleWhitelist = pgTable('reaction_role_whitelist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Blacklist - Roles prevented from reacting
export const reactionRoleBlacklist = pgTable('reaction_role_blacklist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  roleId: text('role_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User-level whitelist for reaction roles
export const reactionRoleUserWhitelist = pgTable('reaction_role_user_whitelist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User-level blacklist for reaction roles
export const reactionRoleUserBlacklist = pgTable('reaction_role_user_blacklist', {
  id: serial('id').primaryKey(),
  messageConfigId: integer('message_config_id').notNull(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reaction Role Assignments - Track assignments for analytics
export const reactionRoleAssignments = pgTable('reaction_role_assignments', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id').notNull(),
  messageConfigId: integer('message_config_id').notNull(),
  optionId: integer('option_id').notNull(),
  roleId: text('role_id').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});


// Role Audit Logs - Comprehensive audit trail
export const roleAuditLogs = pgTable('role_audit_logs', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  userId: text('user_id'),
  roleId: text('role_id'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  details: jsonb('details'),
  performedBy: text('performed_by').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Sticky Messages - Pin important messages that repost automatically
export const stickyMessages = pgTable('sticky_messages', {
  id: serial('id').primaryKey(),
  serverId: text('server_id').notNull(),
  channelId: text('channel_id').notNull(),
  messageContent: text('message_content'),
  embedConfig: jsonb('embed_config').$type<{
    title?: string;
    description?: string;
    color?: string;
    thumbnail?: string;
    image?: string;
    footer?: { text?: string; iconUrl?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }>(),
  mode: text('mode').notNull().default('message'), // 'message' or 'time'
  messageCount: integer('message_count').default(1), // Resend after X messages (for message mode)
  timeInterval: integer('time_interval'), // Resend after X seconds (for time mode)
  currentMessageId: text('current_message_id'), // Current sticky message ID
  currentMessageCount: integer('current_message_count').default(0), // Messages since last sticky
  isPremium: boolean('is_premium').default(false), // Premium features enabled
  webhookConfig: jsonb('webhook_config').$type<{
    name?: string;
    avatarUrl?: string;
  }>(), // Premium: Custom webhook
  slowMode: boolean('slow_mode').default(false), // Premium: Slower posting
  isActive: boolean('is_active').default(true),
  lastSentAt: timestamp('last_sent_at'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
