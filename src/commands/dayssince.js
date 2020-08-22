const Enmap = require("enmap");

exports.run = (bot, message, args) => {
    bot.daysSince = new Enmap({name: "daysSince"});
    switch(args.shift()) {
        case "new":
            createBoard(bot, message, args);
            break;
        case "update":
            updateBoard(bot, message, args);
            break;
        case "view":
            viewBoard(bot, message, args);
            break;
        case "join":
            joinBoard(bot, message, args);
            break;
        case "delete":
            deleteBoard(bot, message, args);
            break;
        case "leave":
            leaveBoard(bot, message, args);
            break;
        case "adminDelete":
            deleteAll(bot, message);
            break;
        case "adminView":
            viewAll(bot, message);
            break;
        default:
            message.channel.send(`${message.author}, that is not a recognized term. Type \`!help\` for parameter info.`);
            break;
    }
};

function getKey (message, title) {
    if (message.channel.type === "text") {
        return `${message.guild.id}-${title}`;
    } else {
        return `${message.author.id}-${title}`;
    }
}

function createBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const title = args.join(" ");
    const key = getKey(message, title);
    const guild = (message.channel.type === "text") ? message.guild.id : null;

    if (enmap.has(key) && (enmap.get(key, "creator") !== message.author.id)) {
        return message.channel.send(`${message.author}, you cannot overwrite a board you did not create.`);
    }

    enmap.set(key, {
        creator: message.author.id,
        members: [],
        guild: guild,
        joinable: (guild ? true : false),
        title: title
    });

    return message.channel.send(`${message.author}, successfully created \`${title}\``);
}

function joinBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const date = new Date(args.shift());

    if (isNaN(date)) {
        return message.channel.send(`${message.author}, that is an invalid date. The format is \`yyyy-mm-dd\``);
    }

    const title = args.join(" ");
    const key = getKey(message, title);
    if (!enmap.has(key)) {
        return message.channel.send(`${message.author}, there are no boards called \`${title}\``);
    }

    const members = enmap.get(key, "members");
    if (members.find(member => member.user.id === message.author.id) !== undefined) {
        return message.channel.send(`${message.author}, you are already a member of \`${title}\`. Please use the update functionality instead.`);
    }

    enmap.push(key, {user: message.author, date: date}, "members");
    return message.channel.send (`${message.author}, you were successfully added to \`${title}\``);
}

function leaveBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const title = args.join(" ");
    const key = getKey(message, title);

    if (!enmap.has(key)) {
        return message.channel.send(`${message.author}, there are no boards called \`${title}\``);
    }

    const allMembers = enmap.get(key, "members");
    const memberIndex = allMembers.findIndex(member => member.user.id === message.author.id);
    if(memberIndex === -1)  {
        return message.channel.send(`${message.author}, you're not a member of \`${title}\`.`);
    }

    allMembers.splice(memberIndex, 1);
    enmap.set(key, allMembers, "members");
    return message.channel.send(`${message.author}, you were successfully removed from \`${title}\`.`);
}

function updateBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const date = new Date(args.shift());

    if (isNaN(date)) {
        return message.channel.send(`${message.author}, that is an invalid date. The format is \`yyyy-mm-dd\`.`);
    }

    const title = args.join(" ");
    const key = getKey(message, title);
    if (!enmap.has(key)) {
        return message.channel.send(`${message.author}, there are no boards called \`${title}\``);
    }

    const allMembers = enmap.get(key, "members");
    const memberIndex = allMembers.findIndex(member => member.user.id === message.author.id);
    if(memberIndex === -1)  {
        return message.channel.send(`${message.author}, you're not a member of \`${title}\`.`);
    }

    allMembers.splice(memberIndex, 1, {user: message.author, date: date});
    enmap.set(key, allMembers, "members");
    return message.channel.send(`${message.author}, you were successfully added to ${title}`);
}

function deleteBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const title = args.join(" ");
    const key = getKey(message, title);

    if (!enmap.has(key)) {
        return message.channel.send(`${message.author}, there are no boards called \`${title}\``);
    }

    if (enmap.get(key, "creator") !== message.author.id) {
        return message.channel.send(`${message.author}, you cannot delete a board that you did not create.`);
    }

    enmap.delete(key);
    return message.channel.send(`${message.author}, ${title} was successfully deleted.`);
}

function viewBoard (bot, message, args) {
    const enmap = bot.daysSince;
    const title = args.join(" ");
    let key = getKey(message, title);

    if (!enmap.has(key)) {
        return message.channel.send(`${message.author}, there are no boards called \`${title}\``);
    }

    const board = enmap.get(key);
    const embedFields = board.members.map(member => {
        const givenDate = new Date(member.date);
        const elapsed = Math.floor((Date.now() - givenDate.getTime())/1000/60/60/24);
        return {
            name: member.user.username,
            value: `${elapsed} day(s) (${givenDate.toLocaleDateString("en-US", {timeZone: "UTC"})})`
        };
    });
    
    return message.channel.send(message.author, {embed: {
        color: 0x799464,
        title: board.title,
        fields: embedFields
    }});
}

/*
  Below are admin instructions. These can only be carried out by the id listed
  under "ownerId" in the bot config. Or whoever you want, if you change the code.
  I'm not the boss of you. :)
*/

function deleteAll(bot, message) {
    const enmap = bot.daysSince;
    if (message.author.id !== bot.config.ownerId) {
        return message.channel.send(`${message.author}, you are not permitted to carry out this action.`);
    }
    enmap.clear();
    return message.channel.send("Successfully cleared all boards.");
}


function viewAll (bot, message) {
    if (message.author.id !== bot.config.ownerId) {
        return message.channel.send(`${message.author}, you are not permitted to carry out this action.`);
    }
    const allIndexes = bot.daysSince.indexes.join("\n");
    return message.channel.send(`All indexes in the daysSince enmap are as follows:\n\`\`\`\n${allIndexes}\`\`\``);
}
