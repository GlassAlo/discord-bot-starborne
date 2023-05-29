const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");

const { initCommands, loadCommands, registerCommand } = require("./loadCommands.js");
const { initEvents, loadEvents, registerEvent } = require("./loadEvents.js");

const intentsList = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
]

class Bot {
    constructor(token, app_token, bot_prefix) {
        // Store the token in a variable
        this.token = token;
        this.app_token = app_token;
        this.prefix = bot_prefix
        // Create a new Discord client
        this.client = new Client({
            intents: intentsList,
        });
        // create the rest client
        this.rest = new REST({ version: "10" })
            .setToken(this.token);
        // Login to Discord
        this.client.login(this.token);
    }
}

Bot.prototype.loadCommands = loadCommands;
Bot.prototype.initCommands = initCommands;
Bot.prototype.registerCommand = registerCommand;

Bot.prototype.loadEvents = loadEvents;
Bot.prototype.initEvents = initEvents;
Bot.prototype.registerEvent = registerEvent;

module.exports = Bot;
