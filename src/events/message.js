module.exports = (bot, message) => {
    // Ignoring bots
    if (message.author.bot) {
        return;
    }

    if (message.content.charAt(0) == bot.config.prefix) {
        const args = message.content.slice(bot.config.prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // Grab the command from the enmap
        const command = bot.commands.get(commandName);

        // Silently exit if the command isn't found
        if (!command) {
            return;
        }

        command.run(bot, message, args);
    }
};