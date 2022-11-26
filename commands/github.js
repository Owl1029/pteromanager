const {SlashCommandBuilder, messageLink} = require('@discordjs/builders');
const {MessageEmbed, MessageActionRow, MessageButton, Constants} = require('discord.js')

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("Replies with the github!"),
    async execute(interaction, client) {
        const embed = new MessageEmbed()
            .setTitle('Github')
            .setColor('AQUA')
            .setURL('https://github.com/Owl1029/pteromanager')
            .setDescription('You can download the source code for this bot by clicking the title')

        interaction.reply({embeds: [embed]})
    }
}