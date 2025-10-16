const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { conversationHistory } = require('./schema');
const { eq, and, desc, lt, sql } = require('drizzle-orm');

const sqlClient = neon(process.env.DATABASE_URL);
const db = drizzle(sqlClient);

async function saveMessage(userId, channelId, serverId, role, content) {
  try {
    if (role === 'system') {
      return;
    }
    
    await db.insert(conversationHistory).values({
      userId,
      channelId,
      serverId: serverId || null,
      role,
      content
    });
    
    console.log(`💾 Saved ${role} message to DB - User: ${userId}, Channel: ${channelId}`);
  } catch (error) {
    console.error('❌ Error saving message to DB:', error);
  }
}

async function loadHistory(userId, channelId, limit = 20) {
  try {
    const messages = await db
      .select()
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, userId),
          eq(conversationHistory.channelId, channelId)
        )
      )
      .orderBy(desc(conversationHistory.createdAt))
      .limit(limit * 2);
    
    const formattedMessages = messages
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    console.log(`📂 Loaded ${formattedMessages.length} messages from DB - User: ${userId}, Channel: ${channelId}`);
    return formattedMessages;
  } catch (error) {
    console.error('❌ Error loading history from DB:', error);
    return [];
  }
}

async function cleanupOldMessages() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await db
      .delete(conversationHistory)
      .where(lt(conversationHistory.createdAt, sevenDaysAgo));
    
    console.log(`🧹 Cleaned up messages older than 7 days`);
    return result;
  } catch (error) {
    console.error('❌ Error cleaning up old messages:', error);
  }
}

async function getConversationStats(serverId = null) {
  try {
    let query;
    
    if (serverId) {
      query = sql`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT channel_id) as unique_channels
        FROM ${conversationHistory}
        WHERE server_id = ${serverId}
      `;
    } else {
      query = sql`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT channel_id) as unique_channels,
          COUNT(CASE WHEN server_id IS NULL THEN 1 END) as dm_messages
        FROM ${conversationHistory}
      `;
    }
    
    const result = await db.execute(query);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error getting conversation stats:', error);
    return null;
  }
}

module.exports = {
  saveMessage,
  loadHistory,
  cleanupOldMessages,
  getConversationStats
};
