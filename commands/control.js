const {SlashCommandBuilder, ActionRowBuilder} = require('@discordjs/builders');
const { ButtonStyle, ComponentType } = require('discord-api-types/v10');
const { MessageEmbed, MessageButton, MessageSelectMenu } = require('discord.js')
const Nodeactyl = require('nodeactyl');

module.exports = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName("control")
        .setDescription("Control your your")
        .addStringOption((option) =>
            option 
                .setName("serverid")
                .setDescription("The server's ID you want to control")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const serverID = interaction.options.getString("serverid");
            const panel = new Nodeactyl.NodeactylClient(client.config.panel.url, client.config.panel.adminkey);

            await interaction.deferReply({ ephemeral: true });
            const serverInfo = await panel.getServerDetails(serverID);
            const serverUsage = await panel.getServerUsages(serverID);
            
            function bytestoMB(bytes) {
                return (bytes / (1024 * 1024)).toFixed(2);
            }
            
            let Buttons = [];

                Buttons[0] = new MessageButton()
                .setCustomId("reinstall")
                .setLabel("Reinstall Server")
                .setEmoji("🔁")
                .setStyle(ButtonStyle.Danger); 

                Buttons[1] = new MessageButton()
                .setCustomId("reload")
                .setLabel("Reload")
                .setEmoji("🔁")
                .setStyle(ButtonStyle.Primary);

                Buttons[2] = new MessageButton()
                .setCustomId("start")
                .setLabel("Start")
                .setEmoji("▶️")
                .setStyle(ButtonStyle.Success);

                Buttons[3] = new MessageButton()
                .setCustomId("stop")
                .setLabel("Stop")
                .setEmoji("🛑")
                .setStyle(ButtonStyle.Danger);
                
                Buttons[4] = new MessageButton()
                .setCustomId("kill")
                .setLabel("Kill")
                .setEmoji("💀")
                .setStyle(ButtonStyle.Danger);

            const embed = new MessageEmbed()
                .setTitle(`**[Controlling: ${serverInfo.name}]\n[Status: ${serverUsage.current_state}]**`)
                .setDescription(`\`[RAM Usage: ${bytestoMB(serverUsage.resources.memory_bytes)}/${serverInfo.limits.memory}MB]\nDisk Usage: ${bytestoMB(serverUsage.resources.disk_bytes)}/${serverInfo.limits.disk}MB\nCPU Usage: ${serverUsage.resources.cpu_absolute}%\``)
                .setFooter({text: "Click the reload  button after every change"})
    
                if (serverUsage.current_state === "offline") {
                    embed.setColor("RED")
                } 
                
                if (serverUsage.current_state === "running") {
                    embed.setColor("GREEN")
                }
        
                interaction.editReply({ embeds: [embed], components: [
                    {
                        type: 1,
                        components: [Buttons[2], Buttons[3], Buttons[4], Buttons[1]]
                    },
                    {
                        type: 1,
                        components: [Buttons[0]]
                    }
                ], ephemeral: true }); 

            const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000, max: 9999 });

            collector.on('collect', async i => {
                if (i.user.id === interaction.user.id) {
                    if (i.customId === "start") {
                        panel.startServer(serverID);
                        embed.setColor("GREEN");
                        interaction.editReply({content: "**Starting Server**", embeds: [embed], ephemeral: true})
                    }

                    if (i.customId === "stop") {
                        panel.stopServer(serverID);
                        embed.setColor("RED");
                        interaction.editReply({content: "**Stopping Server**", embeds: [embed], ephemeral: true})
                    }

                    if (i.customId === "kill") {
                        panel.killServer(serverID);
                        embed.setColor("RED");
                        interaction.editReply({content: "**Killing Server**", embeds: [embed], ephemeral: true})
                    }

                    if (i.customId === "reinstall") {
                        panel.reInstallServer(serverID);
                        embed.setColor("RED");
                        interaction.editReply({content: "**Reinstalling Server**", embeds: [embed], ephemeral: true})
                    }

                    if (i.customId === "reload") {
                        const updatedinfo = await panel.getServerDetails(serverID);
                        const updatedUsage = await panel.getServerUsages(serverID);

                        embed.setTitle(`**[Controlling: ${updatedinfo.name}]\n[Status: ${updatedUsage.current_state}]**`)
                        embed.setDescription(`\`[RAM Usage: ${bytestoMB(updatedUsage.resources.memory_bytes)}/${updatedinfo.limits.memory}MB]\nDisk Usage: ${bytestoMB(updatedUsage.resources.disk_bytes)}/${updatedinfo.limits.disk}MB\nCPU Usage: ${updatedUsage.resources.cpu_absolute}%\``)

                        if (updatedUsage.current_state === "offline") {
                            embed.setColor("RED")
                        } 
                        
                        if (updatedUsage.current_state === "running") {
                            embed.setColor("GREEN")
                        }

                        interaction.editReply({content: "**Reloaded**", embeds: [embed], ephemeral: true})
                    }
                }
            });

        } catch(err) {
            console.log(err)
            interaction.editReply({
                content: "**Wrong information provided**\<:failed:1043958393540444212>",
                ephemeral: true
            })
        }
    }
}