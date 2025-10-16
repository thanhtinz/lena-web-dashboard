const fs = require('fs').promises;
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '../data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'servers.json');

let serverConfigs = {};

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating config directory:', error);
  }
}

async function loadConfigs() {
  try {
    await ensureConfigDir();
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    serverConfigs = JSON.parse(data);
    console.log('✅ Loaded server configs');
  } catch (error) {
    if (error.code === 'ENOENT') {
      serverConfigs = {};
      await saveConfigs();
    } else {
      console.error('Error loading configs:', error);
      serverConfigs = {};
    }
  }
}

async function saveConfigs() {
  try {
    await ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(serverConfigs, null, 2));
  } catch (error) {
    console.error('Error saving configs:', error);
  }
}

function getServerConfig(serverId) {
  if (!serverConfigs[serverId]) {
    serverConfigs[serverId] = {
      mode: 'lena',
      prefix: '!',
      allowedChannels: [],
      keywords: {},
      customResponses: {}
    };
  }
  // Ensure prefix exists for old configs
  if (!serverConfigs[serverId].prefix) {
    serverConfigs[serverId].prefix = '!';
  }
  return serverConfigs[serverId];
}

async function setServerMode(serverId, mode) {
  const config = getServerConfig(serverId);
  config.mode = mode;
  await saveConfigs();
  return config;
}

async function addAllowedChannel(serverId, channelId) {
  const config = getServerConfig(serverId);
  if (!config.allowedChannels.includes(channelId)) {
    config.allowedChannels.push(channelId);
    await saveConfigs();
  }
  return config;
}

async function removeAllowedChannel(serverId, channelId) {
  const config = getServerConfig(serverId);
  config.allowedChannels = config.allowedChannels.filter(id => id !== channelId);
  await saveConfigs();
  return config;
}

async function clearAllowedChannels(serverId) {
  const config = getServerConfig(serverId);
  config.allowedChannels = [];
  await saveConfigs();
  return config;
}

async function addKeyword(serverId, keyword, response) {
  const config = getServerConfig(serverId);
  if (!config.customResponses) {
    config.customResponses = {};
  }
  config.customResponses[keyword.toLowerCase()] = response;
  await saveConfigs();
  return config;
}

async function removeKeyword(serverId, keyword) {
  const config = getServerConfig(serverId);
  if (config.customResponses) {
    delete config.customResponses[keyword.toLowerCase()];
    await saveConfigs();
  }
  return config;
}

function getCustomResponse(serverId, message) {
  const config = getServerConfig(serverId);
  if (!config.customResponses) return null;
  
  const lowerMessage = message.toLowerCase();
  for (const [keyword, response] of Object.entries(config.customResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return null;
}

async function setServerPrefix(serverId, prefix) {
  const config = getServerConfig(serverId);
  config.prefix = prefix;
  await saveConfigs();
  return config;
}

module.exports = {
  loadConfigs,
  saveConfigs,
  getServerConfig,
  setServerMode,
  setServerPrefix,
  addAllowedChannel,
  removeAllowedChannel,
  clearAllowedChannels,
  addKeyword,
  removeKeyword,
  getCustomResponse
};
