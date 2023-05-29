const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with the bot'),

    async execute(bot, interaction) {
        await interaction.reply('HELeP');
    },
};
