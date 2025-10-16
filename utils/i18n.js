const { getServerConfig } = require('../database/configService');

/**
 * Get localized message based on server language
 * @param {string} guildId - Discord guild ID
 * @param {object} messages - Object with vi and en keys
 * @returns {Promise<string>} Localized message
 */
async function t(guildId, messages) {
  if (!guildId) return messages.vi || messages.en || '';
  
  try {
    const config = await getServerConfig(guildId);
    const lang = config?.language || 'vi';
    return messages[lang] || messages.vi || messages.en || '';
  } catch (error) {
    console.error('i18n error:', error);
    return messages.vi || messages.en || '';
  }
}

/**
 * Get localized message synchronously from config object
 * @param {object} config - Server config object with language property
 * @param {object} messages - Object with vi and en keys
 * @returns {string} Localized message
 */
function tSync(config, messages) {
  const lang = config?.language || 'vi';
  return messages[lang] || messages.vi || messages.en || '';
}

/**
 * Get server language
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<string>} Language code (vi or en)
 */
async function getLang(guildId) {
  if (!guildId) return 'vi';
  
  try {
    const config = await getServerConfig(guildId);
    return config?.language || 'vi';
  } catch (error) {
    return 'vi';
  }
}

module.exports = { t, tSync, getLang };
