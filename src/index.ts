import * as Discord from 'discord.js';
import dotenv from 'dotenv';
import resolve, { ampRegex } from './resolver';

dotenv.config();

const client = new Discord.Client();
client.login(process.env.TOKEN as string);

client.on('ready', () => {
  if (client.user) console.log(`Logged in: ${client.user.tag}`);
});

client.on('message', async (msg) => {
  if (msg.author.bot) return;

  // Check if the message might contain an AMP link before doing anything else
  if (!msg.content.match(ampRegex)) return;

  // Then actually check for links
  const extractedUrls = msg.content.match(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm);
  if (!extractedUrls) return;

  msg.channel.send('AMPutating links...').then((output) => {
    resolve(extractedUrls, (links: string[]) => {
      const res = `
AMPutated links:\n${links.join('\n')}\n\n
Done in: ${Math.abs(Date.now() - msg.createdTimestamp)}ms.
      `;
      output.edit(res);
      msg.suppressEmbeds();
    });
  });
});

export default client;
