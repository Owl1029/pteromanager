const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("unsuspendserver")
        .setDescription("Unsuspend a server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to unsuspend.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);

            await interaction.deferReply();

            await panel.unsuspendServer(serverID)

            const embed = new MessageEmbed()
                .setTitle("Unsuspend Server")
                .setColor('AQUA')
                .setURL(client.config.panel.url)
                .setDescription(`**Unsuspended server.**`);
        interaction.editReply({ embeds: [embed] });
        } catch {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}