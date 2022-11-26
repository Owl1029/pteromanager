const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Replies with the commands of the bot!")
        .addStringOption((option) =>
            option 
                .setName("command")
                .setDescription("The command you want information about")
                .setRequired(false)
            ),
    async execute(interaction, client) {
        const command = interaction.options.getString("command");

        if (!command) {
            const embed = new MessageEmbed()
            .setTitle(client.config.hostname)
            .setURL(client.config.panel.url)
            .setColor('AQUA')
            .setDescription("Use !help <command> for extended information on a command")
            .addFields(
                {name: "🤖 Administrator Commands", value: "`checkstatus`, `deleteserver`, `getserver`, `getuserbyemail`, `getuserbyusername`, `killserver`, `reinstallserver`, `restartserver`, `startserver`, `stopserver`, `suspendserver`, `unsuspendserver`"},
                {name: "📌 Support & Help", value: '`help`, `ping`'}
            )
            .setFooter({text:'Created by ShushSpice#6784'})
            interaction.reply({embeds: [embed] });
        } else {
            try {
                const embed = new MessageEmbed()
                    .setTitle(command)
                    .setColor('AQUA')
                    .setDescription(client.commands.get("ping").data.description)
                    interaction.reply({embeds: [embed]});
            } catch(err) {
                console.log(err)
                interaction.reply({
                    content: `**Cannot find that command <:failed:1043958393540444212>**`,
                    ephemeral: true
                });
            }
        }
    }
}