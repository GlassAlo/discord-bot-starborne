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
            let reply_holder = null;

            // Check if the message is an interaction
            if (message.type == 2) {
                // Send the message
                reply_holder = message
            } else {
                // Send the message
                reply_holder = message
            }
            reply_holder.reply(`Pong!`);
    }
};
