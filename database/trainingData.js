const { db } = require('./db');
const { trainingData, conversationLogs, customResponses } = require('./schema');
const { eq, and, like, desc } = require('drizzle-orm');

// Training Data Functions
async function addTrainingData(data) {
  try {
    const [result] = await db.insert(trainingData).values(data).returning();
    return result;
  } catch (error) {
    console.error('Error adding training data:', error);
    return null;
  }
}

async function getTrainingDataForServer(serverId) {
  try {
    return await db
      .select()
      .from(trainingData)
      .where(and(
        eq(trainingData.serverId, serverId),
        eq(trainingData.isActive, true)
      ));
  } catch (error) {
    console.error('Error getting training data:', error);
    return [];
  }
}

async function searchTrainingData(serverId, query) {
  try {
    // Minimum query length to prevent false matches with short words like "ok", "hi", etc.
    const MIN_QUERY_LENGTH = 5;
    
    if (query.trim().length < MIN_QUERY_LENGTH) {
      return [];
    }
    
    // Use Drizzle ORM with proper SQL template
    const { sql } = require('drizzle-orm');
    const results = await db.execute(
      sql`SELECT * FROM training_data 
          WHERE server_id = ${serverId} 
          AND is_active = true 
          AND LOWER(question) LIKE LOWER(${`%${query}%`})`
    );
    
    return results.rows || [];
  } catch (error) {
    console.error('Error searching training data:', error);
    return [];
  }
}

async function deleteTrainingData(id, serverId) {
  try {
    await db
      .delete(trainingData)
      .where(and(
        eq(trainingData.id, id),
        eq(trainingData.serverId, serverId)
      ));
    return true;
  } catch (error) {
    console.error('Error deleting training data:', error);
    return false;
  }
}

async function toggleTrainingData(id, serverId) {
  try {
    const [item] = await db
      .select()
      .from(trainingData)
      .where(and(
        eq(trainingData.id, id),
        eq(trainingData.serverId, serverId)
      ));
    
    if (!item) return null;
    
    const [updated] = await db
      .update(trainingData)
      .set({ isActive: !item.isActive })
      .where(eq(trainingData.id, id))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error toggling training data:', error);
    return null;
  }
}

// Conversation Logging
async function logConversation(log) {
  try {
    await db.insert(conversationLogs).values(log);
  } catch (error) {
    console.error('Error logging conversation:', error);
  }
}

async function getConversationHistory(serverId, limit = 50) {
  try {
    return await db
      .select()
      .from(conversationLogs)
      .where(eq(conversationLogs.serverId, serverId))
      .orderBy(desc(conversationLogs.timestamp))
      .limit(limit);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

// Custom Responses
async function addCustomResponse(response) {
  try {
    const [result] = await db.insert(customResponses).values(response).returning();
    return result;
  } catch (error) {
    console.error('Error adding custom response:', error);
    return null;
  }
}

async function getCustomResponsesForServer(serverId) {
  try {
    return await db
      .select()
      .from(customResponses)
      .where(eq(customResponses.serverId, serverId))
      .orderBy(desc(customResponses.priority));
  } catch (error) {
    console.error('Error getting custom responses:', error);
    return [];
  }
}

async function deleteCustomResponse(id, serverId) {
  try {
    await db
      .delete(customResponses)
      .where(and(
        eq(customResponses.id, id),
        eq(customResponses.serverId, serverId)
      ));
    return true;
  } catch (error) {
    console.error('Error deleting custom response:', error);
    return false;
  }
}

// Search for matching training data or custom response
async function findMatchingResponse(serverId, userMessage) {
  try {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // First check custom responses (higher priority)
    const customResps = await getCustomResponsesForServer(serverId);
    
    // Priority 1: Exact match custom responses
    for (const resp of customResps) {
      if (resp.isExactMatch) {
        if (normalizedMessage === resp.trigger.toLowerCase().trim()) {
          return {
            response: resp.response,
            embedName: resp.embedName || null
          };
        }
      }
    }
    
    // Priority 2: Contains match custom responses
    for (const resp of customResps) {
      if (!resp.isExactMatch) {
        if (normalizedMessage.includes(resp.trigger.toLowerCase())) {
          return {
            response: resp.response,
            embedName: resp.embedName || null
          };
        }
      }
    }
    
    // Priority 3: Training data exact match
    const allTrainingData = await getTrainingDataForServer(serverId);
    for (const data of allTrainingData) {
      if (normalizedMessage === data.question.toLowerCase().trim()) {
        return {
          response: data.answer,
          embedName: null
        };
      }
    }
    
    // Priority 4: Training data contains match (with minimum length requirement)
    const trainingMatches = await searchTrainingData(serverId, userMessage);
    if (trainingMatches.length > 0) {
      // Calculate similarity and return best match
      let bestMatch = trainingMatches[0];
      let bestScore = 0;
      
      for (const match of trainingMatches) {
        const question = match.question.toLowerCase();
        const messageWords = normalizedMessage.split(/\s+/);
        const questionWords = question.split(/\s+/);
        
        // Simple word overlap scoring
        const commonWords = messageWords.filter(word => 
          word.length >= 3 && questionWords.some(qw => qw.includes(word) || word.includes(qw))
        );
        const score = commonWords.length / Math.max(messageWords.length, questionWords.length);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = match;
        }
      }
      
      // Only return if score is good enough (>30% overlap)
      if (bestScore > 0.3) {
        return {
          response: bestMatch.answer,
          embedName: null
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding matching response:', error);
    return null;
  }
}

module.exports = {
  addTrainingData,
  getTrainingDataForServer,
  searchTrainingData,
  deleteTrainingData,
  toggleTrainingData,
  logConversation,
  getConversationHistory,
  addCustomResponse,
  getCustomResponsesForServer,
  deleteCustomResponse,
  findMatchingResponse
};
