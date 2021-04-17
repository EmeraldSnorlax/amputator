import * as Discord from 'discord.js';
import deAmp, { ampRegex } from './deAmp';
import embed from './info';

import TOKEN from './config';

const client = new Discord.Client();
client.login(TOKEN);

client.on('ready', () => {
  if (client.user) console.log(`Logged in: ${client.user.tag}`);
  client.user?.setPresence({ activity: { type: 'WATCHING', name: 'for AMP links' } });
});

client.on('message', async (msg) => {
  if (msg.author.bot) return;

  try {
    if (msg.mentions.has(client.user as Discord.User)) {
      msg.channel.send(embed);
    }

    // Check if the message might contain an AMP link before doing anything else
    if (!msg.content.match(ampRegex)) return;

    // Then actually check for links
    const extractedUrls = msg.content.match(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm);
    if (!extractedUrls) return;

    msg.react('‼️');
    Promise.all(deAmp(extractedUrls))
      .then((links) => {
        const res = `AMPutated links:\n${links.join('\n')}\n\nDone in: ${Math.abs(Date.now() - msg.createdTimestamp)}ms.`;
        msg.channel.send(res);
        msg.suppressEmbeds();
      })
      .catch((err) => {
        msg.channel.send(`Something went wrong!!\n\`\`\`${err}\`\`\``)
          .then((m) => {
            m.react('🗑️')
              .then(() => {
                const filter = (reaction: Discord.MessageReaction) => reaction.emoji.name === '🗑️';
                const collector = m.createReactionCollector(filter, { time: 2 * 60 * 1000 });
                collector.on('collect', () => { m.delete(); });
              });
          });
      });
  } catch {
    try {
      msg.guild?.owner?.send('I failed to send a message, do I have the right perms in your server?');
    } catch {
      console.log('Failed to send the failure message');
    }
  }
});

client.on('guildCreate', (guild) => {
  try {
    guild.systemChannel?.send(embed);
  } finally {
    console.log(`Now in: ${client.guilds.cache.size} guilds!`);
  }
});

export default client;
