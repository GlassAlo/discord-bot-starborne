const { SlashCommandBuilder } = require("@discordjs/builders");

const name = "help";
const description = "Get the help for all commands or one individual command.";
const usage = "help [command]";
const example = "\n ```help [cmd] ``` -> Get the help for a specific command \n ```help``` -> Get the global help";

module.exports = {
    help: {
        name: name,
        description: description,
        usage: usage,
        example: example,
    },
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription(`${description}`)
        .addStringOption((option) => option
            .setName("command")
            .setDescription("The command to get the help for.")),

        run: async (bot, message) => {
            let query = null
            let message_author = null
            let color = 0xe68a00;

            if (message.type == 2) {
                query = message.options.getString("command");
                message_author = message.user
            } else {
                query = message.content.split(" ")[1];
                message_author = message.author
            }

            if (query == null) {
                await message.reply({
                    embeds: [
                    {
                        title: "Help :",
                        description: "Here is a list of all the commands :",
                        color: color,
                        fields: bot.client.commands.map((command) => ({
                            name: command.help.name.toUpperCase(),
                            value: command.help.description,
                        })),
                    },
                ],});
                return;
            }
            const command = bot.client.commands.get(query);
            if (command == null) {
                await message.reply(`${message_author} I don't know that command.`);
                return;
            }
            await message.reply({
                embeds: [
                    {
                        title: `Help for ${command.help.name.toUpperCase()} :`,
                        description:
                            `${command.help.description}\n\nUsage : ${command.help.usage}\n\nExample : ${command.help.example}`,
                        color: color,
                    },
                ],
            });
    }
};
