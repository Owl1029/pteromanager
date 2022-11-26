const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("getuserbyusername")
        .setDescription("Gets information about a user via username")
        .addStringOption((option) =>
            option 
                .setName("username")
                .setDescription("The username you want information about.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const username = interaction.options.getString("username");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);

            await interaction.deferReply();

            const info = await panel.getUserByUsername(username)
            const embed = await new MessageEmbed()
                .setTitle("Account")
                .setColor('AQUA')
                .setURL(client.config.panel.url)
                .setDescription(
                `\`\`\`
UserID: ${info.attributes.id}
Admin: ${info.attributes.root_admin}
UUID: ${info.attributes.uuid}
Username: ${info.attributes.username}
Email: ${info.attributes.email}
First Name: ${info.attributes.first_name}
Last Name: ${info.attributes.last_name}
Language: ${info.attributes.language}\`\`\``);
        interaction.editReply({ embeds: [embed] });
        } catch {
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>"
            })
        }
    }
}