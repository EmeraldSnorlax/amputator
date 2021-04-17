import Discord from 'discord.js';

const embed = new Discord.MessageEmbed()
  .setTitle('Thanks for inviting me!')
  .setDescription('I\'ll be on the look out for AMP links, and send unAMP-ed links.')
  .addField('Why?', '[AMP is bad for the open web](https://www.theregister.com/2017/05/19/open_source_insider_google_amp_bad_bad_bad/)')
  .addField('Invite me + Source Code + Privacy Policy', '[Github repo (GNU AGPL-3.0)](https://github.com/EmeraldSnorlax/amputator)')
  .setColor('#26c6da');

export default embed;
