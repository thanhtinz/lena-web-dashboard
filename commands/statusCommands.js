const { EmbedBuilder } = require('discord.js');

async function handleStatus(message, client) {
  const shardId = client.shard?.ids[0] || 0;
  const totalShards = client.shard?.count || 1;
  const clusterId = Math.floor(shardId / 4);
  
  // Get metrics
  const serverCount = client.guilds.cache.size;
  const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
  const ping = client.ws.ping;
  const uptime = client.uptime;
  
  // Format uptime
  const days = Math.floor(uptime / 86400000);
  const hours = Math.floor((uptime % 86400000) / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  
  let uptimeStr = '';
  if (days > 0) uptimeStr += `${days}d `;
  if (hours > 0) uptimeStr += `${hours}h `;
  if (minutes > 0) uptimeStr += `${minutes}m`;
  if (!uptimeStr) uptimeStr = 'Just now';
  
  const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

  const embed = new EmbedBuilder()
    .setTitle('🤖 Lena Bot Status')
    .setColor('#3b82f6')
    .setDescription(`*Cute bot monitoring system~* 💙`)
    .addFields(
      {
        name: '📊 Cluster Info',
        value: `\`\`\`
Cluster:  ${clusterId}
Shard:    ${shardId}
Total:    ${totalShards} shards
\`\`\``,
        inline: true
      },
      {
        name: '📈 Statistics',
        value: `\`\`\`
Servers:  ${serverCount.toLocaleString()}
Users:    ${userCount.toLocaleString()}
Latency:  ${ping}ms
\`\`\``,
        inline: true
      },
      {
        name: '⏰ System',
        value: `\`\`\`
Uptime:   ${uptimeStr}
Memory:   ${memUsage} MB
Status:   Online 🟢
\`\`\``,
        inline: false
      }
    )
    .setFooter({ 
      text: `Shard ${shardId} • Full status: status.lunabot.net`,
      iconURL: client.user.displayAvatarURL() 
    })
    .setTimestamp();

  // Add server-specific shard info if in a guild
  if (message.guild) {
    const serverShardId = Number(BigInt(message.guild.id) >> BigInt(22)) % totalShards;
    const serverClusterId = Math.floor(serverShardId / 4);
    
    embed.addFields({
      name: '🔍 This Server',
      value: `This server is on **Cluster ${serverClusterId}**, **Shard ${serverShardId}**`,
      inline: false
    });
  }

  return message.reply({ embeds: [embed] });
}

async function handleShardLookup(message, serverId) {
  const totalShards = message.client.shard?.count || 1;
  
  try {
    const shardId = Number(BigInt(serverId) >> BigInt(22)) % totalShards;
    const clusterId = Math.floor(shardId / 4);

    const embed = new EmbedBuilder()
      .setTitle('🔎 Shard Lookup')
      .setColor('#8b5cf6')
      .setDescription(`Finding shard for server...`)
      .addFields(
        {
          name: 'Server ID',
          value: `\`${serverId}\``,
          inline: false
        },
        {
          name: 'Location',
          value: `**Cluster ${clusterId}** → **Shard ${shardId}**`,
          inline: false
        }
      )
      .setFooter({ text: 'Full cluster map: status.lunabot.net' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  } catch (error) {
    return message.reply('❌ Invalid server ID! Please provide a valid Discord server ID.');
  }
}

module.exports = {
  handleStatus,
  handleShardLookup
};
