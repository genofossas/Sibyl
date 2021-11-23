const {Client, Intents} = require("discord.js");
const config = require("./config.json");
const fs = require("fs");
const Enmap = require("enmap");

// Initializing bot info
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
bot.config = config;

// Loading events
fs.readdir("./src/events/", (err, files) => {
    if (err) {
        return console.error(err);
    }
    files.forEach((file) => {
        const event = require(`./events/${file}`);
        const eventName = file.split(".")[0];
        bot.on(eventName, event.bind(null, bot));
    });
});

bot.login(bot.config.token);

// Creating an Enmap for commands
bot.commands = new Enmap();

// Loading commands
fs.readdir("./src/commands/", (err, files) => {
    if (err) {
        return console.error(err);
    }
    files.forEach((file) => {
        if(!file.endsWith(".js")) {
            return;
        }
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        bot.commands.set(commandName, props);
    });
});