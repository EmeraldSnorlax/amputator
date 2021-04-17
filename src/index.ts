import * as Discord from 'discord.js';
import deAmp, { ampRegex } from './deAmp';
import embed from './welcome';

import TOKEN from './config';

const client = new Discord.Client();
client.login(TOKEN);

client.on('ready', () => {
  if (client.user) console.log(`Logged in: ${client.user.tag}`);
  client.user?.setPresence({ activity: { type: 'WATCHING', name: 'for AMP links' } });
});

client.on('message', async (msg) => {
  if (msg.author.bot) return;

  // Check if the message might contain an AMP link before doing anything else
  if (!msg.content.match(ampRegex)) return;

  // Then actually check for links
  const extractedUrls = msg.content.match(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm);
  if (!extractedUrls) return;

  msg.react('‼️');
  deAmp(extractedUrls)
    .then((links) => {
      const res = `AMPutated links:\n${links.join('\n')}\n\nDone in: ${Math.abs(Date.now() - msg.createdTimestamp)}ms.`;
      msg.channel.send(res);
      msg.suppressEmbeds();
    }).catch((err) => {
      msg.channel.send(`Something went wrong!!\n\`\`\`${err}\`\`\``);
    });
});

client.on('guildCreate', (guild) => {
  try {
    guild.systemChannel?.send(embed);
  } finally {
    console.log(`Now in: ${client.guilds.cache.size} guilds!`);
  }
});

export default client;
