import * as Discord from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Discord.Client()!;
client.login(process.env.TOKEN as string);

client.on('ready', () => {
  if (client.user) console.log(`Logged in: ${client.user.tag}`);
});

export default client;
