const fs = require('node:fs');
const path = require('node:path');
const { Routes } = require('discord-api-types/v10');
const { Collection } = require('discord.js');

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
        } else if (item.endsWith('.js')) {
            await this.registerCommand(item, pathToFolder);
        } else {
            console.log(`Could not load ${item}`);
        }
    }
}

// Init commands for all guilds
async function loadCommands(deleteCommands = false) {
    const commandsFolderPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsFolderPath);
    this.commands_list = [];
    this.client.commands = new Collection();

    await this.initCommands(commandFolders, commandsFolderPath);

    if (this.commands_list == null) {
        return
    }
    if (deleteCommands) {
        this.rest.put(Routes.applicationCommands(this.app_token), { body: [] })
            .then(() => console.log('Successfully deleted global commands.'))
            .catch(console.error);
    }
    // For each guild
    this.client.guilds.cache.forEach((guild) => {
        if (deleteCommands) {
            this.rest.put(Routes.applicationGuildCommands(this.app_token, guild.id), {
                body: [],
            }).then(() => {
                console.log(`Cleared commands for ${guild.name}`);
            }).catch(console.error);
        }

        this.rest.put(Routes.applicationGuildCommands(this.app_token, guild.id), {
            body: this.commands_list,
        }).then(() => {
            console.log(`Loaded commands for ${guild.name}`);
        }).catch("ERROR : Loading commands = " + console.error);
    });
    console.log(`Loaded commands for ${this.client.guilds.cache.size} guilds`);
}

module.exports = {
    initCommands,
    loadCommands,
    registerCommand
}
