const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("deleteserver")
        .setDescription("Deletes a server")
        .addIntegerOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to delete")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getInteger("serverid");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);

            await panel.deleteServer(serverID)

            const embed = new MessageEmbed()
            .setTitle("Delete server")
            .setColor('AQUA')
            .setURL(client.config.panel.url)
            .setDescription(`Server deleted.`);
    
            await interaction.reply({embeds: [embed] });
        } catch {
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}