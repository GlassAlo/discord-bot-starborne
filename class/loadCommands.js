const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord-api-types/v10');

async function registerCommand(commandName, folderPath) {
    const commandPath = path.join(folderPath, commandName);
    const command = require(commandPath);

    this.client.commands.set(command.data.name, command);
    this.commands_list.push(command.data.toJSON());
    console.log(`Loaded command ${command.data.name}`);
}

async function initCommands(fsFolder, pathToFolder) {
    for (const item of fsFolder) {
        if (fs.lstatSync(path.join(pathToFolder, item)).isDirectory()) {
            const newPath = path.join(pathToFolder, item);
            const newFSFolder = fs.readdirSync(newPath);

            await this.initCommands(newFSFolder, newPath);
        } else {
            await this.registerCommand(item, pathToFolder);
        }
    }
}

// Init commands for all guilds
async function loadCommands() {
    const commandsFolderPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsFolderPath);
    this.commands_list = [];

    await this.initCommands(commandFolders, commandsFolderPath);

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
    registerCommand
}
