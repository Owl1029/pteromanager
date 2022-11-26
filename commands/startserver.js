const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("startserver")
        .setDescription("Starts the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to start.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);

            await interaction.deferReply();
            const status = await panel.getServerStatus(serverID)

            const embed = new MessageEmbed()
            .setTitle("Start Server")
            .setColor('AQUA')
            .setURL(client.config.panel.url);

            if (status === 'offline') {
                await panel.startServer(serverID);
                embed.setDescription("**Starting server.**");
            } else if(status === 'running') {
                embed.setDescription("**Server is already running.**");
            } else if(status === 'starting') {
                embed.setDescription("**Server is already starting**")
            } else if (status === 'stopping') {
                await panel.stopServer(serverID);
                embed.setDescription("**The server is in-middle of shutting down. Cannot guarantee a successful startup.**")
            }
        interaction.editReply({ embeds: [embed] });
        } catch(err) {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}