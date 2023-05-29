const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload one or all commands')
        .addStringOption(option => option
            .setName('command')
            .setDescription('The command to reload')
            .setRequired(false),
        )
        .addBooleanOption(option => option
            .setName('full_reload')
            .setDescription('delete all the commands from cache and reload them')
            .setRequired(false),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),


    async execute(bot, interaction) {
        const commandName = interaction.options.getString('command') ?? null;
        const fullReload = interaction.options.getBoolean('full_reload') ?? false;

        if (!commandName || fullReload) {
            await bot.loadCommands(fullReload);
            await interaction.reply('Reloaded all commands');
            return;
        }
        const command = bot.client.commands.get(commandName.toLowerCase());
        if (!command) {
            await interaction.reply('Command not found');
            return;
        }
        delete require.cache[require.resolve(`./${command.data.name}.js`)];

        try {
            const newCommand = require(`./${command.data.name}.js`);

            interaction.client.commands.delete(command.data.name);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            console.log(`Command ${newCommand.data.name} was reloaded!`);
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
        } catch (error) {
            console.error(error);
            await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
        }
    },
};
