const { db } = require('../database/db');
const { customCommands } = require('../database/schema');
const { eq, and } = require('drizzle-orm');
const { AllowedMentionsTypes } = require('discord.js');
const { checkServerPremium } = require('../utils/serverPremiumChecker');

const cooldowns = new Map();

async function handleCustomCommand(message, commandName, args, config) {
  try {
    // Check if server has premium for custom commands feature
    const { isPremium } = await checkServerPremium(message.guild.id);
    if (!isPremium) {
      // Silently fail for custom commands if not premium
      // This prevents spam when users type random commands
      return false;
    }

    const commands = await db
      .select()
      .from(customCommands)
      .where(
        and(
          eq(customCommands.serverId, message.guild.id),
          eq(customCommands.commandName, commandName),
          eq(customCommands.enabled, true)
        )
      )
      .limit(1);

    if (commands.length === 0) {
      return false;
    }

    const command = commands[0];

    if (!checkPermissions(message, command)) {
      return false;
    }

    if (!checkCooldown(message, command)) {
      return false;
    }

    if (command.requiredArguments > 0 && args.length < command.requiredArguments) {
      await message.reply({
        content: `❌ This command requires at least ${command.requiredArguments} argument(s).`,
        allowedMentions: { repliedUser: false }
      });
      return true;
    }

    if (command.deleteCommand) {
      try {
        await message.delete();
      } catch (error) {
        console.error('Error deleting command message:', error);
      }
    }

    let responseText = command.response || '';
    
    if (command.additionalResponses && command.additionalResponses.length > 0) {
      const allResponses = [
        { content: command.response, weight: 1 },
        ...command.additionalResponses
      ];
      
      const totalWeight = allResponses.reduce((sum, r) => sum + (r.weight || 1), 0);
      let random = Math.random() * totalWeight;
      
      for (const resp of allResponses) {
        random -= (resp.weight || 1);
        if (random <= 0) {
          responseText = resp.content;
          break;
        }
      }
    }
    
    responseText = parseVariables(message, responseText, args);

    let sentMessage;
    const { EmbedBuilder } = require('discord.js');
    
    const messageOptions = {
      allowedMentions: command.disableMentions 
        ? { parse: [] }
        : { parse: [AllowedMentionsTypes.User] }
    };

    if (command.silentCommand) {
      messageOptions.flags = ['SuppressNotifications'];
    }

    if (command.embedConfig) {
      const embedData = command.embedConfig;
      const embed = new EmbedBuilder();
      
      if (embedData.title) embed.setTitle(parseVariables(message, embedData.title, args));
      if (embedData.description) embed.setDescription(parseVariables(message, embedData.description, args));
      if (embedData.color) embed.setColor(parseInt(embedData.color.replace('#', ''), 16));
      if (embedData.thumbnail) embed.setThumbnail(parseVariables(message, embedData.thumbnail, args));
      if (embedData.image) embed.setImage(parseVariables(message, embedData.image, args));
      
      if (embedData.author) {
        embed.setAuthor({
          name: parseVariables(message, embedData.author.name || '', args),
          iconURL: embedData.author.iconUrl,
          url: embedData.author.url
        });
      }
      
      if (embedData.footer) {
        embed.setFooter({
          text: parseVariables(message, embedData.footer.text || '', args),
          iconURL: embedData.footer.iconUrl
        });
      }
      
      if (embedData.fields && embedData.fields.length > 0) {
        embedData.fields.forEach(field => {
          embed.addFields({
            name: parseVariables(message, field.name, args),
            value: parseVariables(message, field.value, args),
            inline: field.inline || false
          });
        });
      }
      
      messageOptions.embeds = [embed];
      if (responseText) {
        messageOptions.content = responseText;
      }
    } else {
      messageOptions.content = responseText;
    }
    
    if (command.dmResponse) {
      try {
        sentMessage = await message.author.send(messageOptions);
      } catch (error) {
        console.error('Error sending DM:', error);
        await message.reply({
          content: '❌ Could not send DM. Please check your privacy settings.',
          allowedMentions: { repliedUser: false }
        });
      }
    } else {
      const targetChannel = command.responseChannel 
        ? message.guild.channels.cache.get(command.responseChannel) || message.channel
        : message.channel;

      sentMessage = await targetChannel.send(messageOptions);
    }

    if (command.deleteAfter > 0 && sentMessage) {
      setTimeout(async () => {
        try {
          await sentMessage.delete();
        } catch (error) {
          console.error('Error auto-deleting message:', error);
        }
      }, command.deleteAfter * 1000);
    }

    await db
      .update(customCommands)
      .set({ 
        useCount: command.useCount + 1,
        updatedAt: new Date()
      })
      .where(eq(customCommands.id, command.id));

    return true;
  } catch (error) {
    console.error('Error handling custom command:', error);
    return false;
  }
}

function checkPermissions(message, command) {
  if (command.allowedRoles.length > 0) {
    const hasAllowedRole = message.member.roles.cache.some(role => 
      command.allowedRoles.includes(role.id)
    );
    if (!hasAllowedRole) {
      return false;
    }
  }

  if (command.ignoredRoles.length > 0) {
    const hasIgnoredRole = message.member.roles.cache.some(role => 
      command.ignoredRoles.includes(role.id)
    );
    if (hasIgnoredRole) {
      return false;
    }
  }

  if (command.allowedChannels.length > 0) {
    if (!command.allowedChannels.includes(message.channel.id)) {
      return false;
    }
  }

  if (command.ignoredChannels.length > 0) {
    if (command.ignoredChannels.includes(message.channel.id)) {
      return false;
    }
  }

  return true;
}

function checkCooldown(message, command) {
  if (command.cooldownSeconds <= 0) {
    return true;
  }

  const cooldownKey = `${message.guild.id}-${command.id}-${message.author.id}`;
  const now = Date.now();
  const cooldownAmount = command.cooldownSeconds * 1000;

  if (cooldowns.has(cooldownKey)) {
    const expirationTime = cooldowns.get(cooldownKey) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      message.reply({
        content: `⏰ Please wait ${timeLeft.toFixed(1)} more second(s) before using this command again.`,
        allowedMentions: { repliedUser: false }
      }).catch(console.error);
      return false;
    }
  }

  cooldowns.set(cooldownKey, now);
  setTimeout(() => cooldowns.delete(cooldownKey), cooldownAmount);

  return true;
}

function parseVariables(message, text, args) {
  if (!text) return '';

  return text
    .replace(/{user}/gi, `<@${message.author.id}>`)
    .replace(/{username}/gi, message.author.username)
    .replace(/{user\.id}/gi, message.author.id)
    .replace(/{user\.tag}/gi, message.author.tag)
    .replace(/{user\.displayname}/gi, message.member?.displayName || message.author.username)
    .replace(/{user\.avatar}/gi, message.author.displayAvatarURL())
    
    .replace(/{server}/gi, message.guild.name)
    .replace(/{server\.name}/gi, message.guild.name)
    .replace(/{server\.id}/gi, message.guild.id)
    .replace(/{server\.membercount}/gi, message.guild.memberCount.toString())
    .replace(/{server\.icon}/gi, message.guild.iconURL() || 'No icon')
    
    .replace(/{channel}/gi, `<#${message.channel.id}>`)
    .replace(/{channel\.name}/gi, message.channel.name)
    .replace(/{channel\.id}/gi, message.channel.id)
    
    .replace(/{args}/gi, args.join(' '))
    .replace(/{args\.(\d+)}/gi, (match, index) => args[parseInt(index)] || '')
    
    .replace(/{date}/gi, new Date().toLocaleDateString())
    .replace(/{time}/gi, new Date().toLocaleTimeString())
    .replace(/{timestamp}/gi, Date.now().toString())
    
    .replace(/{random\.(\d+)-(\d+)}/gi, (match, min, max) => {
      const minNum = parseInt(min);
      const maxNum = parseInt(max);
      return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum).toString();
    });
}

async function checkForCustomCommands(message, prefix) {
  try {
    if (!message.content.startsWith(prefix)) {
      return false;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const config = await db.query.serverConfigs.findFirst({
      where: (configs, { eq }) => eq(configs.serverId, message.guild.id)
    });

    return await handleCustomCommand(message, commandName, args, config);
  } catch (error) {
    console.error('Error checking custom commands:', error);
    return false;
  }
}

module.exports = {
  handleCustomCommand,
  checkForCustomCommands,
  parseVariables
};
