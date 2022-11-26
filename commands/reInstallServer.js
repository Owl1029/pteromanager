const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("reinstallserver")
        .setDescription("Reinstalls the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's id you want to reinstall.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);
            await panel.reinstallServer(serverID)
            const embed = await new MessageEmbed()
            .setTitle("Reinstall server")
            .setColor('AQUA')
            .setURL(client.config.panel.url)
            .setDescription(`Reinstalling the server.`);
        interaction.reply({ embeds: [embed] });
        } catch(err) {
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}