const { REST, Routes } = require('discord.js');
const slashCommands = require('../commands/slashCommands');

async function deploySlashCommands(clientId, guildIds = []) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  
  const commands = slashCommands.map(command => command.toJSON());
  
  try {
    console.log('🔄 Đang deploy slash commands...');
    
    if (guildIds.length > 0) {
      // Deploy to specific guilds (faster for testing)
      for (const guildId of guildIds) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        );
      }
      console.log(`✅ Đã deploy ${commands.length} slash commands cho ${guildIds.length} server(s)`);
    } else {
      // Deploy globally (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Đã deploy ${commands.length} slash commands globally`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi deploy slash commands:', error);
  }
}

module.exports = { deploySlashCommands };
