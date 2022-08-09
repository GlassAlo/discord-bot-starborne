const { SlashCommandBuilder } = require("@discordjs/builders");

const name = "ping";
const description = "Ping the bot";
const usage = "ping";
const example = "\n ```ping```";

module.exports = {
    help: {
        name: name,
        description: description,
        usage: usage,
        example: example,
    },
    data: new SlashCommandBuilder()
        .setName(name)
        .setDescription(`${description}`),

        run: async (bot, message) => {
            // Check if the message is an interaction
            if (message.type == 2) {
                // Send the message
                message.reply(`Pong! \`${message.timestamp - message.createdTimestamp}ms\``);
            } else {
                // Send the message
                message.channel.send(`Pong! \`${message.timestamp - message.createdTimestamp}ms\``);
            }
    }
};
