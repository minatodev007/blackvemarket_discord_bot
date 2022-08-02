const { MessageEmbed } = require("discord.js")
const config = require("../config.js");
const { settings } = require("../modules/settings.js");

exports.run = (client, message, args, level) => {

  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Hunter Bot')
    .setAuthor('Global Hunter', 'https://cdn.discordapp.com/avatars/904964094493331486/ebe7fe26128d07966cdae514f1701d90.png', 'https://discord.js.org')
    .setDescription(`[Follow this link to buy a role.](${config.siteUrl}/buyrole/guilds/${message.guild.id}/members/${message.author.id}) (${config.siteUrl}/buyrole/guilds/${message.guild.id}/members/${message.author.id})`)
    .setThumbnail('https://cdn.discordapp.com/avatars/904964094493331486/ebe7fe26128d07966cdae514f1701d90.png')
    .setTimestamp()
    .setFooter('Some footer text here', 'https://cdn.discordapp.com/avatars/904964094493331486/ebe7fe26128d07966cdae514f1701d90.png');

  // message.channel.send({ embeds: [embed] });

  const replying = settings.ensure(message.guild.id, config.defaultSettings).commandReply;
  message.reply({ embeds: [embed], allowedMentions: { repliedUser: (replying === "true") } });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["buyrole"],
  permLevel: "User"
};

exports.help = {
  name: "buyrole",
  category: "Miscellaneous",
  description: "Follow the link to buy a role",
  usage: "buyrole"
};

