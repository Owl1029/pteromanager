const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("restartserver")
        .setDescription("Restarts the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to restart.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);

            await interaction.deferReply();
            const status = await panel.getServerStatus(serverID)

            const embed = new MessageEmbed()
            .setTitle("Restart Server")
            .setColor('AQUA')
            .setURL(client.config.panel.url);

            if (status === 'offline') {
                embed.setDescription("**The server is offline.**");
            } else if(status === 'running') {
                await panel.restartServer(serverID);
                embed.setDescription("**Restarting server.**");
            } else if(status === 'starting') {
                await panel.restartServer(serverID);
                embed.setDescription("**The server is in-middle of starting up. Cannot guarantee a successful restart.**")
            } else if (status === 'stopping') {
                await panel.restartServer(serverID);
                embed.setDescription("**The server is in-middle of shutting down. Cannot guarantee a successful restart.**")
            }
        interaction.editReply({ embeds: [embed] });
        } catch(err) {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}