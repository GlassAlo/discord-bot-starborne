const { Client, Intents, Collection } = require("discord.js");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],});
// Load the .env file if it exists
const dotenv = require('dotenv');
dotenv.config();