module.exports = (bot) => {
    bot.user.setActivity(`Type ${bot.config.prefix}help for commands!`, 4);
    console.log("Bot ready");
};