const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const schema = require('./schema');

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL not found. Database features will be disabled."
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS training_data (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS conversation_logs (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        personality_mode TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS custom_responses (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        trigger TEXT NOT NULL,
        response TEXT NOT NULL,
        is_exact_match BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 0,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS confession_configs (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL UNIQUE,
        channel_id TEXT,
        button_label TEXT DEFAULT '📝 Gửi Confession',
        reply_button_label TEXT DEFAULT '💬 Trả lời',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS confessions (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        thread_id TEXT,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS confession_replies (
        id SERIAL PRIMARY KEY,
        confession_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        is_moderated BOOLEAN DEFAULT false,
        moderated_by TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        moderated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS giveaways (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT,
        host_id TEXT NOT NULL,
        prize TEXT NOT NULL,
        winner_count INTEGER DEFAULT 1,
        required_role TEXT,
        end_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'active',
        winners TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS giveaway_participants (
        id SERIAL PRIMARY KEY,
        giveaway_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS giveaway_blacklist (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        blacklisted_by TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS moderation_configs (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL UNIQUE,
        log_channel_id TEXT,
        mute_role_id TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS warnings (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        removed_at TIMESTAMP,
        removed_by TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_training_server ON training_data(server_id);
      CREATE INDEX IF NOT EXISTS idx_training_active ON training_data(is_active);
      CREATE INDEX IF NOT EXISTS idx_custom_server ON custom_responses(server_id);
      CREATE INDEX IF NOT EXISTS idx_logs_server ON conversation_logs(server_id);
      CREATE INDEX IF NOT EXISTS idx_confession_server ON confessions(server_id);
      CREATE INDEX IF NOT EXISTS idx_confession_thread ON confessions(thread_id);
      CREATE INDEX IF NOT EXISTS idx_confession_reply ON confession_replies(confession_id);
      CREATE INDEX IF NOT EXISTS idx_giveaway_server ON giveaways(server_id);
      CREATE INDEX IF NOT EXISTS idx_giveaway_status ON giveaways(status);
      CREATE INDEX IF NOT EXISTS idx_giveaway_participant ON giveaway_participants(giveaway_id);
      CREATE INDEX IF NOT EXISTS idx_giveaway_blacklist_server ON giveaway_blacklist(server_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_server ON moderation_configs(server_id);
      CREATE INDEX IF NOT EXISTS idx_warnings_server ON warnings(server_id);
      CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_id);
      CREATE INDEX IF NOT EXISTS idx_warnings_status ON warnings(status);

      CREATE TABLE IF NOT EXISTS sticky_messages (
        id SERIAL PRIMARY KEY,
        server_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_content TEXT,
        embed_config JSONB,
        mode TEXT NOT NULL DEFAULT 'message',
        message_count INTEGER DEFAULT 1,
        time_interval INTEGER,
        current_message_id TEXT,
        current_message_count INTEGER DEFAULT 0,
        is_premium BOOLEAN DEFAULT false,
        webhook_config JSONB,
        slow_mode BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        last_sent_at TIMESTAMP,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sticky_server_channel ON sticky_messages(server_id, channel_id);
      CREATE INDEX IF NOT EXISTS idx_sticky_active ON sticky_messages(is_active);
    `);
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}

module.exports = {
  pool,
  db,
  initializeDatabase
};
