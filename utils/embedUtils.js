const { db } = require('../database/db');
const { customEmbeds } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { EmbedBuilder } = require('discord.js');

function parseColor(colorStr) {
  if (!colorStr) return null;
  
  const hex = colorStr.replace('#', '');
  
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }
  
  return parseInt(hex, 16);
}

function buildEmbedFromData(embedData) {
  const embed = new EmbedBuilder();
  
  if (embedData.title) embed.setTitle(embedData.title);
  if (embedData.description) embed.setDescription(embedData.description);
  if (embedData.color) {
    const color = parseColor(embedData.color);
    if (color !== null) embed.setColor(color);
  }
  
  if (embedData.authorName) {
    embed.setAuthor({
      name: embedData.authorName,
      iconURL: embedData.authorIcon || undefined
    });
  }
  
  if (embedData.footerText) {
    embed.setFooter({
      text: embedData.footerText,
      iconURL: embedData.footerIcon || undefined
    });
  }
  
  if (embedData.imageUrl) embed.setImage(embedData.imageUrl);
  if (embedData.thumbnailUrl) embed.setThumbnail(embedData.thumbnailUrl);
  
  if (embedData.fields) {
    try {
      const fields = JSON.parse(embedData.fields);
      if (Array.isArray(fields)) {
        embed.addFields(fields);
      }
    } catch (err) {
      // Invalid fields JSON, skip
    }
  }
  
  return embed;
}

async function getEmbedByName(serverId, embedName) {
  const result = await db.select()
    .from(customEmbeds)
    .where(and(
      eq(customEmbeds.serverId, serverId),
      eq(customEmbeds.name, embedName)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return buildEmbedFromData(result[0]);
}

module.exports = {
  parseColor,
  buildEmbedFromData,
  getEmbedByName
};
