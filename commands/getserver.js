const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: ["ADMINISTRATOR"],
    data: new SlashCommandBuilder()
        .setName("getserver")
        .setDescription("Replies with the information of the server")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to get information")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);
            const info = await panel.getServerDetails(serverID)
            const usage = await panel.getServerUsages(serverID)
            
            const embed = new MessageEmbed()
                .setTitle("Server Information")
                .setColor('AQUA')
                .setURL(client.config.panel.url)
                .setDescription(
                `\`\`\`
Identifier: ${info.identifier}
InternalID: ${info.internal_id}
UUID: ${info.uuid}
Name: ${info.name}
Node: ${info.node}
Limits:
     Memory: ${usage.resources.memory_bytes} Bytes/${info.limits.memory} MB
     Disk: ${usage.resources.disk_bytes} Bytes/${info.limits.disk} MB
     CPU: ${usage.resources.cpu_absolute}/${info.limits.cpu}%
     Swap: ${info.limits.swap}  
     io: ${info.limits.io}
     Threads: ${info.limits.threads}
     OOM Disabled: ${info.limits.oom_disabled}
Invocation: ${info.invocation}
Docker Image; ${info.docker_image}
Egg Features: ${info.egg_features}
Feature Limits:
     Databases: ${info.feature_limits.databases}
     Allocations: ${info.feature_limits.allocations}
     Backups: ${info.feature_limits.backups}
Status: ${usage.current_state}
Is suspended: ${info.is_suspended}
Is installing: ${info.is_installing}
is transferring: ${info.is_transferring}
Renewable: ${info.renewable}
renewal: ${info.renewal}
BG: ${info.bg}\`\`\``);
            await interaction.reply({embeds: [embed] });
        } catch {
            interaction.reply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}