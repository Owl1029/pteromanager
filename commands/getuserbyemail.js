const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("getuserbyemail")
        .setDescription("Gets information about a user via email")
        .addStringOption((option) =>
            option 
                .setName("email")
                .setDescription("The user's email.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const email = interaction.options.getString("email");
            const panel = new Nodeactyl.NodeactylApplication(client.config.panel.url, client.config.panel.key);

            await interaction.deferReply();

            const info = await panel.getUserByEmail(email)
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
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}