const generalHelpEmbed = {
    color: 0x799464,
    title: 'Supported Commands',
    fields: [
        {
            name: '!daysSince [...args]',
            value: 'Creates an embed that displays the date since something has happened. Type `!help daysSince` for specific command usage.'
        },
        {
            name: '!help',
            value: 'Displays supported commands and usage.'
        },
        {
            name: '!clown [...args]',
            value: 'Creates and manages clownery leaderboards. Type `!help clown` for specific command usage.'
        },
        {
            name: '!info',
            value: 'Displays information about the bot.'
        }
    ]
};

const daysSinceHelpEmbed = {
    color: 0x799464,
    title: 'daysSince Command',
    description: 'Creates and manages an embed that displays the date since something has happened.',
    fields: [
        {
            name: '!daysSince new [name]',
            value: 'Creates a new board with a given name.'
        },
        {
            name: '!daysSince join [yyyy-mm-dd] [name]',
            value: 'Join an existing board with a given name.'
        },
        {
            name: '!daysSince update [yyyy-mm-dd] [name]',
            value: 'Update your listing in a board with a given name.'
        },
        {
            name: '!daysSince leave [name]',
            value: 'Leave a board with a given name'
        },
        {
            name: '!daysSince delete [name]',
            value: 'Deletes a board. Can only be done by the board\'s creator.'
        },
        {
            name: '!daysSince view [name]',
            value: 'View a board with a given name.'
        }
    ]
};

const clownHelpEmbed = {
    color: 0x799464,
    title: 'clown Command',
    description: 'Keeps track of the clownery of your fellow server mates.',
    fields: [
        {
            name: '!clown start',
            value: 'Starts a new clown season. Only one clown season can be run at a time.'
        },
        {
            name: '!clown poll [@username] [# votes] [clown offense]',
            value: 'Creates a clown poll. The user-specified number of votes determines how many votes are needed overall to come to a verdict.'
        },
        {
            name: '!clown view',
            value: 'See the current clown season\'s leaderboards.'
        },
        {
            name: '!clown end',
            value: 'End the current clown season. Only the creator of a season can end it.'
        },
        {
            name: '!clown adminEnd',
            value: 'Admin command that clears the enmap of clown seasons. Note that this will delete all seasons across all servers.'
        }
    ]
}

exports.run = (bot, message, args) => {
    const channel =  bot.channels.cache.get(message.channelId)
    switch (args.shift()) {
        case 'daysSince':
            channel.send({content: `${message.author},`, embeds: [daysSinceHelpEmbed]});
            break;
        case 'clown':
            channel.send({content: `${message.author},`, embeds: [clownHelpEmbed]})
            break;
        default:
            channel.send({content: `${message.author},`, embeds: [generalHelpEmbed]})
            break;       
    }
};