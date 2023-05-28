const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(bot, client) {
        await bot.loadCommands();
        console.log(`Logged in as ${client.user.tag}!`);
    },
};
