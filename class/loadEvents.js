const fs = require('node:fs');
const path = require('node:path');

async function registerEvent(eventName, folderPath) {
    const eventPath = path.join(folderPath, eventName);
    const event = require(eventPath);

    if (event.once) {
        this.client.once(event.name, (...args) => {
            args.unshift(this);
            event.execute(...args);
        });
    } else {
        this.client.on(event.name, (...args) => {
            args.unshift(this);
            event.execute(...args);
        });
    }
}

async function initEvents(fsFolder, pathToFolder) {
    for (const item of fsFolder) {
        if (fs.lstatSync(path.join(pathToFolder, item)).isDirectory()) {
            const newPath = path.join(pathToFolder, item);
            const newFSFolder = fs.readdirSync(newPath);

            await this.initEvents(newFSFolder, newPath);
        } else {
            await this.registerEvent(item, pathToFolder);
        }
    }
}

async function loadEvents() {
    const eventsFolderPath = path.join(__dirname, '../events');
    const eventFolders = fs.readdirSync(eventsFolderPath);

    await this.initEvents(eventFolders, eventsFolderPath);
}

module.exports = {
    initEvents,
    loadEvents,
    registerEvent
}
