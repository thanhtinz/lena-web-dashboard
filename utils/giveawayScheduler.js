const { db } = require('../database/db');
const { giveaways, giveawayParticipants } = require('../database/schema');
const { eq, and, lte } = require('drizzle-orm');
const { selectWinners, createGiveawayEmbed } = require('../commands/giveawayHandlers');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let schedulerInterval = null;

async function checkAndEndGiveaways(client) {
  try {
    const now = new Date();
    
    const expiredGiveaways = await db.select()
      .from(giveaways)
      .where(and(
        eq(giveaways.status, 'active'),
        lte(giveaways.endTime, now)
      ));
    
    if (expiredGiveaways.length === 0) {
      return;
    }
    
    console.log(`⏰ Found ${expiredGiveaways.length} expired giveaway(s) to end`);
    
    for (const giveaway of expiredGiveaways) {
      try {
        const guild = await client.guilds.fetch(giveaway.serverId);
        const winners = await selectWinners(giveaway, guild);
        
        await db.update(giveaways)
          .set({ 
            status: 'ended',
            winners: winners.length > 0 ? JSON.stringify(winners) : null
          })
          .where(eq(giveaways.id, giveaway.id));
        
        try {
          const channel = await guild.channels.fetch(giveaway.channelId);
          const message = await channel.messages.fetch(giveaway.messageId);
          
          // Edit giveaway message to show it ended
          const lenaLove = '<:lena_love:1427387648896532593>';
          const endEmbed = new EmbedBuilder()
            .setTitle(giveaway.prize)
            .setColor(0x808080);
          
          let endDescription = '';
          
          if (winners.length > 0) {
            const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
            endDescription += `${lenaLove} Người thắng: ${winnerMentions}\n`;
          } else {
            endDescription += `${lenaLove} Người thắng: Không có\n`;
          }
          
          endDescription += `${lenaLove} Tổ chức bởi: <@${giveaway.hostId}>\n`;
          endDescription += `${lenaLove} Kết thúc | <t:${Math.floor(Date.now() / 1000)}:R>`;
          
          endEmbed.setDescription(endDescription);
          
          // Set server logo as author
          if (guild) {
            endEmbed.setAuthor({
              name: guild.name,
              iconURL: guild.iconURL({ dynamic: true }) || undefined
            });
          }
          
          // Set creator avatar as thumbnail
          try {
            const host = await guild.members.fetch(giveaway.hostId).catch(() => null);
            if (host) {
              endEmbed.setThumbnail(host.user.displayAvatarURL({ dynamic: true }));
            }
          } catch (err) {
            // Host might have left the server
          }
          
          await message.edit({
            content: '🏅 **GIVEAWAY ĐÃ KẾT THÚC** 🏅',
            embeds: [endEmbed]
          });
          
          // Remove reactions
          try {
            await message.reactions.removeAll();
          } catch (err) {
            console.error('Error removing reactions:', err);
          }
          
          // Send winner announcement with button
          if (winners.length > 0) {
            const lenaWin = '<:lena_win:1427373082862948422>';
            const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
            const winnerMessage = `${lenaWin} Xin chúc mừng, ${winnerMentions} đã trúng giveaway **${giveaway.prize}** tổ chức bởi <@${giveaway.hostId}>`;
            
            const giveawayButton = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel('Giveaway')
                  .setStyle(ButtonStyle.Link)
                  .setURL(message.url)
              );
            
            await channel.send({
              content: winnerMessage,
              components: [giveawayButton]
            });
          } else {
            await channel.send(`❌ Không có người thắng hợp lệ cho giveaway **${giveaway.prize}**`);
          }
        } catch (err) {
          console.error(`Error ending giveaway ID ${giveaway.id}:`, err);
        }
        
        console.log(`✅ Ended giveaway #${giveaway.id} - Winners: ${winners.length}`);
      } catch (err) {
        console.error(`Error ending giveaway #${giveaway.id}:`, err);
      }
    }
  } catch (error) {
    console.error('Error in giveaway scheduler:', error);
  }
}

function startGiveawayScheduler(client) {
  if (schedulerInterval) {
    console.log('⚠️ Giveaway scheduler already running');
    return;
  }
  
  console.log('🎉 Starting giveaway auto-end scheduler (check every 30s)');
  
  schedulerInterval = setInterval(() => {
    checkAndEndGiveaways(client);
  }, 30000);
  
  checkAndEndGiveaways(client);
}

function stopGiveawayScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('🛑 Giveaway scheduler stopped');
  }
}

module.exports = {
  startGiveawayScheduler,
  stopGiveawayScheduler,
  checkAndEndGiveaways
};
