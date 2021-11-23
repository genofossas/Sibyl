const generalHelpEmbed = {
    color: 0x799464,
    title: "Supported Commands",
    fields: [
        {
            name: "!daysSince [...args]",
            value: "Creates an embed that displays the date since something has happened. Type `!help daysSince` for specific command usage."
        },
        {
            name: "!help",
            value: "Displays supported commands and usage."
        },
        {
            name: "!clown",
            value: "Creates and manages clownery leaderboards. Type `!help clown` for specific command usage."
        },
        {
            name: "!info",
            value: "Displays information about the bot."
        }
    ]
};

const daysSinceHelpEmbed = {
    color: 0x799464,
    title: "daysSince Command",
    description: "Creates and manages an embed that displays the date since something has happened.",
    fields: [
        {
            name: "!daysSince new [name]",
            value: "Creates a new board with a given name."
        },
        {
            name: "!daysSince join [yyyy-mm-dd] [name]",
            value: "Join an existing board with a given name."
        },
        {
            name: "!daysSince update [yyyy-mm-dd] [name]",
            value: "Update your listing in a board with a given name."
        },
        {
            name: "!daysSince leave [name]",
            value: "Leave a board with a given name"
        },
        {
            name: "!daysSince delete [name]",
            value: "Deletes a board. Can only be done by the board's creator."
        },
        {
            name: "!daysSince view [name]",
            value: "View a board with a given name."
        }
    ]
};

const clownHelpEmbed = {
    color: 0x799464,
    title: 'clown Command',
    description: 'Keeps track of the clownery of your fellow server mates.',
    fields: [
        {
            name: '!clown poll',
            value: 'Creates a clown poll.'
        }
    ]
}

exports.run = (bot, message, args) => {
    const channel =  bot.channels.cache.get(message.channelId)
    switch (args.shift()) {
        case "daysSince":
            channel.send({content: `${message.author},`, embeds: [daysSinceHelpEmbed]});
            break;
        case "clown":
            channel.send({content: `${message.author},`, embeds: [clownHelpEmbed]})
            break;
        default:
            channel.send({content: `${message.author},`, embeds: [generalHelpEmbed]})
            break;       
    }
};