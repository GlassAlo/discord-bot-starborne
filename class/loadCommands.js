const path = require("node:path");
const fs = require("node:fs");
const { Routes } = require("discord.js");

// Init the commands from the command folder
async function initCommands() {
    const commandsPath = path.join(__dirname, "../commands");
    let commandsFiles = null;
    this.commands_list = [];

    try {
        commandsFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js"));
    } catch (error) {
        console.log("ERROR = " + error);
        return
    }
    for (const file of commandsFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        this.client.commands.set(command.data.name, command);
        this.commands_list.push(command.data.toJSON());
        console.log(`Loaded command ${command.data.name}`);
    }
}

  // Init commands for all guilds
async function loadCommands() {
    await this.initCommands()

    if (this.commands_list == null) {
        return
    }
    // For each guild
    this.client.guilds.cache.forEach((guild) => {
        this.rest.put(Routes.applicationGuildCommands(this.app_token, guild.id), {
            body: this.commands_list,
        })
            .catch("ERROR : Loading commands = " + console.error);
        console.log(`Initializing commands for ${guild.name}`);
    });
}

module.exports = {
    initCommands,
    loadCommands,
}
