const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    once: true,

    async execute(bot, client) {
        await bot.loadCommands(true);
        console.log(`Joined a new guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    },
};
