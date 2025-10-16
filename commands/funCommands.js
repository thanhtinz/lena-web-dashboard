const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

// Coin Flip
async function handleFlip(message) {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const emoji = result === 'Heads' 
    ? '<:lena_coin:1427375804572238035>' 
    : '<:lena_coin_tail:1427467433840480296>';
  
  const embed = new EmbedBuilder()
    .setTitle(`${emoji} Coin Flip`)
    .setDescription(`The coin landed on: **${result}**!`)
    .setColor(result === 'Heads' ? 0xFFD700 : 0xC0C0C0)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

// Space Station Info
async function handleSpace(message) {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();
    const peopleRes = await fetch('http://api.open-notify.org/astros.json');
    const peopleData = await peopleRes.json();

    const embed = new EmbedBuilder()
      .setTitle('🛸 International Space Station')
      .setColor(0x1E90FF)
      .addFields(
        { name: '📍 Position', value: `Latitude: ${parseFloat(data.iss_position.latitude).toFixed(2)}°\nLongitude: ${parseFloat(data.iss_position.longitude).toFixed(2)}°` },
        { name: '👨‍🚀 People in Space', value: `${peopleData.number} astronauts currently in space` }
      )
      .setTimestamp()
      .setFooter({ text: 'Data from Open Notify API' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch space station info!');
  }
}

// Dad Joke
async function handleDadJoke(message) {
  try {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle('😂 Dad Joke')
      .setDescription(data.joke)
      .setColor(0xFFA500)
      .setTimestamp()
      .setFooter({ text: 'Powered by icanhazdadjoke.com' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch dad joke!');
  }
}

// Chuck Norris Fact
async function handleNorris(message) {
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle('💪 Chuck Norris Fact')
      .setDescription(data.value)
      .setColor(0xFF0000)
      .setThumbnail('https://api.chucknorris.io/img/avatar/chuck-norris.png')
      .setTimestamp()
      .setFooter({ text: 'Powered by chucknorris.io' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch Chuck Norris fact!');
  }
}

// GitHub Repo Info
async function handleGitHub(message, args) {
  if (!args.length) {
    return message.reply('❌ Please provide a repository! Example: `?github owner/repo`');
  }

  const repo = args[0].includes('/') ? args[0] : `${args[0]}/${args[1] || ''}`;
  
  if (!repo.includes('/')) {
    return message.reply('❌ Invalid format! Use: `?github owner/repo`');
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    
    if (!response.ok) {
      return message.reply('❌ Repository not found!');
    }

    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle(`📦 ${data.full_name}`)
      .setURL(data.html_url)
      .setDescription(data.description || 'No description provided')
      .setColor(0x238636)
      .addFields(
        { name: '⭐ Stars', value: data.stargazers_count.toLocaleString(), inline: true },
        { name: '🍴 Forks', value: data.forks_count.toLocaleString(), inline: true },
        { name: '👁️ Watchers', value: data.watchers_count.toLocaleString(), inline: true },
        { name: '📝 Language', value: data.language || 'N/A', inline: true },
        { name: '📜 License', value: data.license?.name || 'None', inline: true },
        { name: '🐛 Open Issues', value: data.open_issues_count.toLocaleString(), inline: true }
      )
      .setTimestamp(new Date(data.updated_at))
      .setFooter({ text: `Created ${new Date(data.created_at).toLocaleDateString()}` });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch GitHub repository!');
  }
}

// Cat Picture
async function handleCat(message) {
  try {
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle('🐱 Random Cat')
      .setImage(data[0].url)
      .setColor(0xFF69B4)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch cat picture!');
  }
}

// Dog Picture
async function handleDog(message) {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle('🐕 Random Dog')
      .setImage(data.message)
      .setColor(0x8B4513)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch dog picture!');
  }
}

// Pug Picture
async function handlePug(message) {
  try {
    const response = await fetch('https://dog.ceo/api/breed/pug/images/random');
    const data = await response.json();

    const embed = new EmbedBuilder()
      .setTitle('🐶 Random Pug')
      .setImage(data.message)
      .setColor(0xFFA07A)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch pug picture!');
  }
}

// Pokemon Info
async function handlePokemon(message, args) {
  if (!args.length) {
    return message.reply('❌ Please provide a Pokemon name! Example: `?pokemon pikachu`');
  }

  const pokemonName = args[0].toLowerCase();

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    
    if (!response.ok) {
      return message.reply('❌ Pokemon not found!');
    }

    const data = await response.json();
    const types = data.types.map(t => t.type.name).join(', ');
    const abilities = data.abilities.map(a => a.ability.name).join(', ');
    
    // Safely get artwork URL with fallback
    const artworkUrl = data.sprites?.other?.['official-artwork']?.front_default 
      || data.sprites?.front_default 
      || null;

    const embed = new EmbedBuilder()
      .setTitle(`#${data.id} ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`)
      .setColor(0xFF0000);
    
    // Only set thumbnail if artwork URL exists
    if (artworkUrl) {
      embed.setThumbnail(artworkUrl);
    }
    
    embed.addFields(
      { name: '📊 Type', value: types, inline: true },
      { name: '⚡ Abilities', value: abilities, inline: true },
      { name: '📏 Height', value: `${data.height / 10}m`, inline: true },
      { name: '⚖️ Weight', value: `${data.weight / 10}kg`, inline: true },
      { name: '📈 Base Experience', value: `${data.base_experience || 'N/A'}`, inline: true },
      { name: '💪 Base Stats', value: data.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join('\n') }
    )
      .setTimestamp()
      .setFooter({ text: 'Powered by PokeAPI' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch Pokemon info!');
  }
}

// iTunes Search
async function handleItunes(message, args) {
  if (!args.length) {
    return message.reply('❌ Please provide a song name! Example: `?itunes Shape of You`');
  }

  const query = args.join(' ');

  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return message.reply('❌ Song not found!');
    }

    const song = data.results[0];

    const embed = new EmbedBuilder()
      .setTitle(`🎵 ${song.trackName}`)
      .setURL(song.trackViewUrl)
      .setDescription(`by ${song.artistName}`)
      .setThumbnail(song.artworkUrl100.replace('100x100', '300x300'))
      .setColor(0xFF1493)
      .addFields(
        { name: '💿 Album', value: song.collectionName, inline: true },
        { name: '📅 Release', value: new Date(song.releaseDate).toLocaleDateString(), inline: true },
        { name: '🎼 Genre', value: song.primaryGenreName, inline: true },
        { name: '⏱️ Duration', value: `${Math.floor(song.trackTimeMillis / 60000)}:${((song.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, '0')}`, inline: true },
        { name: '💰 Price', value: `$${song.trackPrice || 'N/A'}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Powered by iTunes API' });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    await message.reply('❌ Failed to fetch song info!');
  }
}

// Random Color
async function handleRandomColor(message) {
  const randomColor = Math.floor(Math.random() * 16777215);
  const hexColor = '#' + randomColor.toString(16).padStart(6, '0');

  const embed = new EmbedBuilder()
    .setTitle('🎨 Random Color')
    .setDescription(`**Hex Code:** ${hexColor}\n**Decimal:** ${randomColor}`)
    .setColor(randomColor)
    .setThumbnail(`https://singlecolorimage.com/get/${hexColor.slice(1)}/400x400`)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

// Member Count
async function handleMemberCount(message) {
  if (!message.guild) {
    return message.reply('❌ This command only works in servers!');
  }

  const total = message.guild.memberCount;
  const bots = message.guild.members.cache.filter(m => m.user.bot).size;
  const humans = total - bots;

  const embed = new EmbedBuilder()
    .setTitle(`👥 ${message.guild.name} Member Count`)
    .setColor(0x5865F2)
    .addFields(
      { name: '📊 Total Members', value: total.toLocaleString(), inline: true },
      { name: '👤 Humans', value: humans.toLocaleString(), inline: true },
      { name: '🤖 Bots', value: bots.toLocaleString(), inline: true }
    )
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

// Whois (User Info)
async function handleWhois(message, args) {
  let user = message.mentions.users.first();
  
  if (!user && args[0]) {
    try {
      user = await message.client.users.fetch(args[0]);
    } catch (err) {
      return message.reply('❌ User not found!');
    }
  }
  
  if (!user) {
    user = message.author;
  }

  const member = message.guild?.members.cache.get(user.id);
  const fetchedUser = await user.fetch();

  const embed = new EmbedBuilder()
    .setTitle(`📋 User Info - ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setColor(fetchedUser.accentColor || 0x5865F2)
    .addFields(
      { name: '🆔 User ID', value: user.id },
      { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` },
      { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true }
    );

  if (member && member.joinedTimestamp) {
    embed.addFields(
      { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
      { name: '🎭 Roles', value: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name).join(', ') || 'None' }
    );
  }

  if (fetchedUser.banner) {
    embed.setImage(fetchedUser.bannerURL({ size: 512 }));
  }

  embed.setTimestamp();

  await message.reply({ embeds: [embed] });
}

// Poll
const activePolls = new Map();

async function handlePoll(message, args, duration = null) {
  if (args[0] === 'show' && args[1]) {
    // Show poll results
    const messageId = args[1].split('/').pop();
    const poll = activePolls.get(messageId);
    
    if (!poll) {
      return message.reply('❌ Poll not found or has expired!');
    }

    try {
      const pollMessage = await message.channel.messages.fetch(messageId);
      const reactions = pollMessage.reactions.cache;
      
      const results = poll.choices.map((choice, index) => {
        const emoji = poll.emojis[index];
        const count = reactions.get(emoji)?.count - 1 || 0;
        return `${emoji} **${choice}**: ${count} vote${count !== 1 ? 's' : ''}`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`📊 Poll Results: ${poll.question}`)
        .setDescription(results)
        .setColor(0x00FF00)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      return message.reply('❌ Failed to fetch poll results!');
    }
  }

  // Create new poll
  const content = args.join(' ');
  const parts = content.match(/"([^"]+)"/g);
  
  if (!parts || parts.length < 3) {
    return message.reply('❌ Invalid format! Use: `?poll "Question" "Choice1" "Choice2" ... [duration_minutes]`\nExample: `?poll "Favorite color?" "Red" "Blue" "Green" 5`');
  }

  const question = parts[0].replace(/"/g, '');
  const choices = parts.slice(1, 11).map(c => c.replace(/"/g, ''));
  
  // Check for duration at the end (after all quotes)
  if (!duration) {
    const remainingContent = content.substring(content.lastIndexOf('"') + 1).trim();
    const durationMatch = remainingContent.match(/^(\d+)$/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
      if (duration < 1 || duration > 10080) {
        return message.reply('❌ Duration must be between 1 and 10080 minutes (1 week)!');
      }
    }
  }

  if (choices.length < 2) {
    return message.reply('❌ You need at least 2 choices!');
  }

  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  const description = choices.map((choice, i) => `${emojis[i]} ${choice}`).join('\n');

  // Build footer text
  let footerText = `Poll by ${message.author.tag}`;
  if (duration) {
    const endTime = Math.floor(Date.now() / 1000) + (duration * 60);
    footerText += ` | Kết thúc: <t:${endTime}:R>`;
  } else {
    footerText += ' | Use ?poll show [message ID] to see results';
  }

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${question}`)
    .setDescription(description)
    .setColor(0x5865F2)
    .setFooter({ text: footerText })
    .setTimestamp();

  const pollMessage = await message.reply({ embeds: [embed] });

  // Add reactions with improved error handling
  for (let i = 0; i < choices.length; i++) {
    try {
      await pollMessage.react(emojis[i]);
    } catch (err) {
      console.error(`❌ Failed to add reaction ${emojis[i]} to poll:`, err.message);
      // Try to notify user if first reaction fails (permissions issue)
      if (i === 0) {
        await message.reply('⚠️ Bot không có quyền Add Reactions! Vui lòng thêm quyền cho bot.').catch(() => {});
      }
      break;
    }
  }

  // Store poll data
  activePolls.set(pollMessage.id, {
    question,
    choices,
    emojis: emojis.slice(0, choices.length),
    authorId: message.author.id,
    channelId: message.channel.id,
    guildId: message.guild?.id
  });

  // Auto-end and publish results if duration is set
  if (duration) {
    setTimeout(async () => {
      try {
        const poll = activePolls.get(pollMessage.id);
        if (!poll) return;

        const channel = await message.client.channels.fetch(poll.channelId).catch(() => null);
        if (!channel) {
          activePolls.delete(pollMessage.id);
          return;
        }

        const fetchedPollMessage = await channel.messages.fetch(pollMessage.id);
        const reactions = fetchedPollMessage.reactions.cache;
        
        // Calculate results with winner
        const results = poll.choices.map((choice, index) => {
          const emoji = poll.emojis[index];
          const count = reactions.get(emoji)?.count - 1 || 0;
          return { choice, emoji, count };
        });

        // Sort by vote count to find winner(s)
        results.sort((a, b) => b.count - a.count);
        const maxVotes = results[0].count;
        const winners = results.filter(r => r.count === maxVotes);

        // Build result message
        const resultText = results.map(r => 
          `${r.emoji} **${r.choice}**: ${r.count} vote${r.count !== 1 ? 's' : ''}`
        ).join('\n');

        let winnerText = '\n\n🏆 **Winner';
        if (winners.length > 1) {
          winnerText += 's (Tie):** ' + winners.map(w => `${w.emoji} ${w.choice}`).join(', ');
        } else {
          winnerText += `:** ${winners[0].emoji} ${winners[0].choice}`;
        }

        const resultEmbed = new EmbedBuilder()
          .setTitle(`📊 Poll Ended: ${poll.question}`)
          .setDescription(resultText + winnerText)
          .setColor(0xFFD700)
          .setFooter({ text: `Poll by ${message.author.tag} | Ended` })
          .setTimestamp();

        await channel.send({ embeds: [resultEmbed] });
        
        // Delete poll data
        activePolls.delete(pollMessage.id);
      } catch (error) {
        console.error('Failed to publish poll results:', error);
        activePolls.delete(pollMessage.id);
      }
    }, duration * 60 * 1000);
  } else {
    // Auto-delete poll data after 24 hours if no duration set
    setTimeout(() => {
      activePolls.delete(pollMessage.id);
    }, 24 * 60 * 60 * 1000);
  }
}

// Info commands
async function handleInfo(message) {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  const embed = new EmbedBuilder()
    .setTitle('🤖 Lena Bot Information')
    .setDescription('Your intelligent Discord companion with AI capabilities')
    .setColor(0x5865F2)
    .addFields(
      { name: '📊 Servers', value: message.client.guilds.cache.size.toLocaleString(), inline: true },
      { name: '👥 Users', value: message.client.users.cache.size.toLocaleString(), inline: true },
      { name: '⏱️ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
      { name: '💻 Node.js', value: process.version, inline: true },
      { name: '📦 Discord.js', value: require('discord.js').version, inline: true },
      { name: '🧠 AI Model', value: 'GPT-4o-mini', inline: true }
    )
    .setThumbnail(message.client.user.displayAvatarURL())
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handleUptime(message) {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const embed = new EmbedBuilder()
    .setTitle('⏱️ Bot Uptime')
    .setDescription(`Bot has been running for:\n**${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds**`)
    .setColor(0x00FF00)
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

async function handlePremium(message) {
  const { handlePremiumCommand } = require('./premiumCommands');
  await handlePremiumCommand(message);
}

module.exports = {
  handleFlip,
  handleSpace,
  handleDadJoke,
  handleNorris,
  handleGitHub,
  handleCat,
  handleDog,
  handlePug,
  handlePokemon,
  handleItunes,
  handleRandomColor,
  handleMemberCount,
  handleWhois,
  handlePoll,
  handleInfo,
  handleUptime,
  handlePremium
};
