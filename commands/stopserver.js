const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("stopserver")
        .setDescription("Stops the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to stop.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);

            await interaction.deferReply();
            const status = await panel.getServerStatus(serverID)

            const embed = new MessageEmbed()
            .setTitle("Stop Server")
            .setColor('AQUA')
            .setURL(client.config.panel.url);

            if (status === 'running') {
                await panel.stopServer(serverID);
                embed.setDescription("**Stopping server.**");
            } else if(status === 'offline') {
                embed.setDescription("**Server is already offline.**");
            } else if(status === 'stopping') {
                embed.setDescription("**Server is already stopping**")
            } else if (status === 'starting') {
                await panel.stopServer(serverID);
                embed.setDescription("**The server is in-middle of starting. Cannot guarantee a successful shutdown.**")
            }
        interaction.editReply({ embeds: [embed] });
        } catch(err) {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}