const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("killserver")
        .setDescription("Kills the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's id you want to kill.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);
            

            await interaction.deferReply();

            const status = await panel.getServerStatus(serverID)
            const embed = await new MessageEmbed()
            .setTitle("Kill Server")
            .setColor('AQUA')
            .setURL(client.config.panel.url);

            if (status === 'offline') {
                embed.setDescription("**The server is offline.**");
            } else if(status === 'running') {
                await panel.killServer(serverID);
                embed.setDescription("**Killing server.**");
            } else if(status === 'starting') {
                await panel.killServer(serverID);
                embed.setDescription("**The server is in-middle of starting up. Killing server.**")
            } else if (status === 'stopping') {
                await panel.killServer(serverID);
                embed.setDescription("**The server is in-middle of shutting down. Killing server.**")
            }
        interaction.editReply({ embeds: [embed] });
        } catch {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}