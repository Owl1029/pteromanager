const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("suspendserver")
        .setDescription("Suspend a server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to suspend.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);
            await panel.suspendServer(serverID)

            const embed = new MessageEmbed()
                .setTitle("Suspend Server")
                .setColor('AQUA')
                .setURL(client.config.panel.url)
                .setDescription(`**Suspended server.**`);
        interaction.reply({ embeds: [embed] });
        } catch {
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}