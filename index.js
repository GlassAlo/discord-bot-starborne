// Load the .env file if it exists
const dotenv = require('dotenv');
dotenv.config();

const bot_instance = require('./class/discord_class.js');
const bot = new bot_instance(process.env.BOT_TOKEN, process.env.APP_TOKEN, process.env.BOT_PREFIX);

bot.client.once('ready', () => {
    bot.loadCommands();
    console.log(`Logged in as ${bot.client.user.tag}!`);
});

bot.client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(bot.prefix)) return;

    const args = message.content.slice(bot.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = bot.client.commands.get(command);

    if (!cmd) return;

    try {
        await cmd.run(bot, message);
    } catch (error) {
        console.error(error);
        message.channel.createMessage(`An error occured while running the command ${command}`);
    }
});

bot.client.on('interactionCreate', async (interaction) => {
    const command = bot.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(bot, interaction);
    } catch (error) {
        console.error(error);
        interaction.message.channel.createMessage(`An error occured while running the command ${interaction.commandName}`);
    }
});