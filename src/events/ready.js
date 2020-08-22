module.exports = (bot) => {
    bot.user.setActivity(`Type ${bot.config.prefix}help for commands!`);
    console.log("Bot ready");
};