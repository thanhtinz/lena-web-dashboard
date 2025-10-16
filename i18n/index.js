const fs = require('fs');
const path = require('path');

// Cache translations để không phải load lại
const translations = {};

/**
 * Load translation file (supports both flat and nested structure)
 * @param {string} lang - Language code (vi, en)
 * @param {string} domain - Optional domain name (moderation, giveaway, etc.)
 */
function loadTranslation(lang, domain = null) {
  const cacheKey = domain ? `${lang}:${domain}` : lang;
  
  if (translations[cacheKey]) {
    return translations[cacheKey];
  }

  try {
    let filePath;
    
    // Try nested structure first (locales/vi/moderation.json)
    if (domain) {
      filePath = path.join(__dirname, 'locales', lang, `${domain}.json`);
      if (fs.existsSync(filePath)) {
        translations[cacheKey] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return translations[cacheKey];
      }
    }
    
    // Fallback to flat structure (locales/vi.json)
    filePath = path.join(__dirname, 'locales', `${lang}.json`);
    translations[cacheKey] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return translations[cacheKey];
  } catch (error) {
    console.error(`Failed to load translation for ${lang}${domain ? ':' + domain : ''}:`, error);
    // Fallback to Vietnamese if language not found
    if (lang !== 'vi') {
      return loadTranslation('vi', domain);
    }
    return {};
  }
}

/**
 * Get translation for a key
 * @param {string} lang - Language code (vi, en)
 * @param {string} key - Translation key (e.g., 'common.error' or 'moderation:errors.noPerm')
 * @param {object} params - Parameters to replace in translation (e.g., {user: 'John'})
 * @returns {string} Translated text
 */
function t(lang, key, params = {}) {
  // Support domain syntax: "moderation:errors.noPerm"
  let domain = null;
  let translationKey = key;
  
  if (key.includes(':')) {
    [domain, translationKey] = key.split(':');
  }
  
  const translation = loadTranslation(lang, domain);
  
  // Navigate through nested keys (e.g., 'errors.noPerm')
  const keys = translationKey.split('.');
  let result = translation;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Key not found, return the key itself
      return key;
    }
  }
  
  // Replace parameters - support both {{user}} and {user} format
  if (typeof result === 'string' && params) {
    result = result.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
    result = result.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return result || key;
}

/**
 * Get translation helper for a specific server
 * @param {object} db - Database connection
 * @param {string} serverId - Server ID
 * @returns {Promise<Function>} Translation function
 */
async function getServerTranslator(db, serverId) {
  try {
    // Get server language from database
    const { serverConfigs } = require('../database/schema');
    const { eq } = require('drizzle-orm');
    
    const config = await db.select()
      .from(serverConfigs)
      .where(eq(serverConfigs.serverId, serverId))
      .limit(1);
    
    const lang = config[0]?.language || 'vi';
    
    // Return a bound translation function
    return (key, params) => t(lang, key, params);
  } catch (error) {
    console.error('Error getting server translator:', error);
    // Fallback to Vietnamese
    return (key, params) => t('vi', key, params);
  }
}

/**
 * Get language from server config (use cached config to avoid DB calls)
 * @param {object} config - Server config object
 * @returns {string} Language code (vi/en)
 */
function getLang(config) {
  return config?.language || 'vi';
}

module.exports = {
  t,
  getLang,
  loadTranslation,
  getServerTranslator
};
