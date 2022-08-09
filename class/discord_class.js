const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");

const { initCommands, loadCommands } = require("./loadCommands.js");

const intentsList = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
]

class bot {
    constructor(token, app_token, bot_prefix) {
        // Store the token in a variable
        this.token = token;
        this.app_token = app_token;
        this.prefix = bot_prefix
        // Create a new Discord client
        this.client = new Client({
            intents: intentsList,
        });
        // Create a new Discord collection
        this.client.commands = new Collection();
        // create the rest client
        this.rest = new REST({ version: "10" })
            .setToken(this.token);
        // Login to Discord
        this.client.login(this.token);
    }
}

//* Add all the different methods to the bot class
// Add the methods to load commands to the bot class
bot.prototype.loadCommands = loadCommands;
bot.prototype.initCommands = initCommands;

module.exports = bot;
