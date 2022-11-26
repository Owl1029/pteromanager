const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with the ping of the bot!"),
    async execute(interaction, client) {
        interaction.reply({
            content: `Pong:ping_pong:! ${client.ws.ping}ms`,
            ephemeral: true
        });
    }
}