const fs = require('fs');
const child = require('child_process');

if (Number(process.version.split('.')[0]) < 16) {
	console.log('Invalid NodeJS Version!, Please use NodeJS 16.x or upper')
	process.exit()
}
if (fs.existsSync('./node_modules')) {
	const check = require('./node_modules/discord.js/package.json')
	if (Number(check.version.split('.')[0]) !== 13) {
		console.log('Invalid Discord.JS Version!, Please use Discord.JS 13.x')
		process.exit()
	}
} else {
	console.log('You didn\'t install the required node packages first!')
	console.log('Please wait... starting to install all required node packages using child process')
	try {
		child.execSync('npm i')
		console.log('Install complete!, please run "node index" command again!')
		process.exit()
	} catch (err) {
		console.log('Error! ', err)
		console.log('Support Server: https://discord.gg/svqDa5TaxA')
		process.exit()
	}
}

const Discord = require('discord.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const chalk = require('chalk')
const checkStatus = require('./handlers/checkStatus')
const yaml = require('js-yaml');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'));

const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(".js"));
const commands = [];

client.commands = new Discord.Collection();
client.config = config

// Requires everything in /commands folder and registeres them to client.commands
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// Ready event
client.once('ready', () => {
    console.log(chalk.green("Commands & Features by Owl"))
    console.log(chalk.green("PteroStats by HirziDevs"))
    console.log(chalk.cyan('[INFO] ') + chalk.green(`${client.user.tag} started!`));

    if (client.config.bot_status.enable && client.config.bot_status.text.length > 0) {
        if (!['PLAYING', 'WATCHING', 'LISTENING', 'COMPETING'].includes(client.config.bot_status.type.toUpperCase() || client.config.bot_status.type.length < 1)) {
            console.log(chalk.red('[ERROR] ') + chalk.red('Err! Invalid Status Type!, Can be "WATCHING", "PLAYING", "LISTENING", or "COMPETING"'))
        } else {
            client.user.setActivity(client.config.bot_status.text, { type: client.config.bot_status.type.toUpperCase() })
        }
    }

    if (client.config.refresh < 10) console.log(chalk.yellow('[WARN] ' + chalk.yellow('Refresh lower than 10 seconds is not recommended!')))

    const CLIENT_ID = client.user.id;

    const rest = new REST({
        version: "9"
    }).setToken(config.token);

    (async () => {
        try {
            if(config.ENV === "production"){
                await rest.put(Routes.applicationCommands(CLIENT_ID), {
                    body: commands
                });
                console.log(chalk.cyan('[INFO] ' + chalk.green("Successfully registered commands globally.")));
            } else {
                await rest.put(Routes.applicationGuildCommands(CLIENT_ID, config.GUILD_ID), {
                    body: commands
                }); 
                console.log(chalk.cyan('[INFO] ' + chalk.green("Successfully registered commands locally.")));
            }
        } catch (err) {
            if (err) console.error(err);
        }

        checkStatus(client)

		setInterval(() => {
			checkStatus(client)
		}, client.config.refresh * 1000)
    })();
});

// Permissions
const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
]

client.on('interactionCreate', async interaciton => {
    if (!interaciton.isCommand()) return;

    // Permission handler
    const cmd = client.commands.get(interaciton.commandName);

    if(cmd.permissions.length){
        let invalidPerms = []
        for(const perm of cmd.permissions){
          if(!validPermissions.includes(perm)){
            return console.log(`Invalid Permissions ${perm}`);
          }
          if(!interaciton.member.permissions.has(perm)){
            invalidPerms.push(perm);
          }
        }
        if (invalidPerms.length){
          return interaciton.reply({
            content: `**You don't have permission to execute this command.** <:failed:1043958393540444212>`,
            ephemeral: true
          });
        }
    }

    // Execute command
    const command = client.commands.get(interaciton.commandName);

    if (!command) return;

    try {
        await command.execute(interaciton, client);
    } catch(err) {
        if (err) console.error(err);

        await interaciton.reply({
            content: "**An error occurred while exeucting this command.** \<:failed:1043958393540444212>",
            ephemeral: true
        })
    }
});

client.login(config.token);