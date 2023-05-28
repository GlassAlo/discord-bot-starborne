const dotenv = require('dotenv').config();

const botCtor = require('./class/bot.js');
const bot = new botCtor(process.env.BOT_TOKEN, process.env.APP_TOKEN, process.env.BOT_PREFIX);

bot.loadEvents();

bot.client.login(process.env.BOT_TOKEN);
