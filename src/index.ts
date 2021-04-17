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

  if (msg.mentions.has(client.user as Discord.User)) {
    msg.channel.send(embed)
      .catch(() => {
        msg.guild?.owner?.send(`I failed to send a message in <#${msg.channel}>, do I have the right perms in your server?`);
      }).catch(() => {});
  }

  // Check if the message might contain an AMP link before doing anything else
  if (!msg.content.match(ampRegex)) return;

  // Then actually check for links
  const extractedUrls = msg.content.match(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm);
  if (!extractedUrls) return;

  msg.react('‼️')
    .catch(() => {
      msg.guild?.owner?.send(`I failed to react in <#${msg.channel}>, do I have the right perms in your server?`);
    }).catch(() => {});

  Promise.all(deAmp(extractedUrls))
    .then((links) => {
      const res = `AMPutated links:\n${links.join('\n')}\n\nDone in: ${Math.abs(Date.now() - msg.createdTimestamp)}ms.`;
      msg.channel.send(res);
      msg.suppressEmbeds();
    })
    .catch((err) => {
      msg.channel.send(`Something went wrong!!\n\`\`\`${err}\`\`\``)
        .then((m) => {
          m.react('🗑️');
          const filter = (reaction: Discord.MessageReaction) => reaction.emoji.name === '🗑️' && reaction.count! > 1;
          const collector = m.createReactionCollector(filter, { time: 2 * 60 * 1000 });
          collector.on('collect', () => { m.delete(); });
        })
        .catch(() => {
          msg.guild?.owner?.send('I failed to send a message and/or react, do I have the right perms in your server?');
        }).catch(() => {});
    });
});

client.on('guildCreate', (guild) => {
  guild.systemChannel?.send(embed).catch(() => {
    guild.owner?.send('I failed to send a message, do I have the right perms in your server?');
  }).catch(() => {});
});

export default client;
