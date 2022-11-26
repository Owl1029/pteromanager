const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("checkstatus")
        .setDescription("Checks status of a server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to check status for")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);
            const status = await panel.getServerStatus(serverID)

            const embed = new MessageEmbed()
            .setTitle("Check Status")
            .setColor('AQUA')
            .setURL(client.config.panel.url)
            .setDescription(`Status: ${status}`);
    
            await interaction.reply({embeds: [embed] });
        } catch {
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}