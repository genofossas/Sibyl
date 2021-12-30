const Enmap = require("enmap");
const { ReactionCollector } = require("discord.js")

exports.run = (bot, message, args) => {
    const channel = bot.channels.cache.get(message.channelId);

    if (channel.type !== 'GUILD_TEXT') {
        return channel.send(`This command is only compatible with servers.`)
    }

    switch(args.shift()) {
        case "poll":
            createPoll(bot, message, channel, args);
            break;
        case "start":
            newClownSeason(bot, message, channel, args);
            break;
        case "initialize":
            //TODO: Implement this feature.
            break;
        case "view":
            viewLeaderboard(bot, message, channel, args);
            break;
        case "end":
            endClownSeason(bot, message, channel, args);
            break;
        case "adminEnd":
            adminEnd(bot, message, channel, args);
            break;
        default:
            channel.send(`${message.author}, that is not a recognized command. Type \`!help clown\` for parameter info.`);
            break;
    }
}

function viewLeaderboard (bot, message, channel, args) {
    const enmap = bot.clownBoard;
    const key =  message.guild.id;

    if (!enmap.has(key)) {
        return channel.send(`${message.author}, there are no clown seasons running for this server.`);
    }

    const board = enmap.get(key);
    const embedFields = board.scores.map(score => {
        return {
            name: bot.users.cache.get(score.id).username,
            value: score.val.toString()
        };
    });
    
    const embed = {
        color: 0x000000,
        title: ":clown: Clown Leaderboard :clown:",
        fields: embedFields
    };

    channel.send({
        content: `${message.author},`,
        embeds: [embed]
    });
}

function newClownSeason (bot, message, channel, args) {
    const enmap = bot.clownBoard;
    const key = message.guild.id;

    if (enmap.has(key)) {
        return channel.send(`${message.author}, a clown season already exists for this server. Please end it first.`);
    }

    enmap.set(key, {
        creator: message.author.id,
        scores: [],
        polls: []
    });

    return channel.send(`${message.author}, a new server clown season has been created.`)
}

function endClownSeason (bot, message, channel, args) {
    const enmap = bot.clownBoard;
    const key = message.guild.id;

    if (!enmap.has(key)) {
        return channel.send(`${message.author}, this server does not have an ongoing clown season.`);
    }

    seasonOwner = enmap.get(key, "creator");

    if (seasonOwner != message.author.id) {
        return channel.send(`${message.author}, you are not authorized to end this clown season.`);
    }

    enmap.delete(key)
    return channel.send(`${message.author}, the clown season has been ended.`);
}

async function createPoll (bot, message, channel, args) {
    const enmap = bot.clownBoard;
    const user = args.shift();
    const userId = user.replace(/[\\<>@#&!]/g, "");
    const numVotes = args.shift();
    const description = args.join(" ");
    const guild = message.guild.id

    if (!enmap.has(guild)) {
        return channel.send(`${message.author}, there is no active clown season for this server.`);
    }

    const activePolls = enmap.get(guild, "polls");
    if (activePolls.includes(userId)) {
        return channel.send(`${message.author}, there is already an ongoing clown poll for ${user}.`)
    }
    
    const embed = {
        color: 0x000000,
        title: ":clown: Clown Poll :clown:",
        description: "React with :clown: if you think that this is a clown action or :x: if you don't.",
        fields: [
            {
                name: "Clown offense",
                value: description
            },
            {
                name: "Clown in question",
                value: `${user}`
            },
            {
                name: "Number of votes needed",
                value: numVotes
            }
        ]
    }

    let msg = await channel.send({
        content: "Hear ye, hear ye @everyone, it's time for a clown poll!",
        embeds:[embed]
    });

    enmap.push(guild, userId, "polls")
    reactCollectorHelper(msg, channel, numVotes, enmap, guild, userId, user)
}


function reactCollectorHelper (msg, channel, numVotes, enmap, key, clownId, clownMention) {
    const votes = {}

    const filter = (reaction, user) => {
        const emoji = reaction.emoji.name;

        // Make sure it's a valid emoji and that the user
        // voting isn't the clown in question
        const emojiBool = emoji === '🤡' || emoji === '❌' || emoji === '🚮';
        const validUser = user.id !== clownId

        // Make proper filtering decision based on prior criteria
        if (emojiBool && validUser) {
            return true;
        } else {
            msg.reactions.resolve(reaction.emoji.name).users.remove(user.id)
            return false
        }
    }

    const collector = new ReactionCollector(msg, {filter: filter, maxUsers: numVotes});
    collector.on('collect', (reaction, user) => {
        // Deleting msg for polls deleted.
        if (reaction.emoji.name === '🚮') {
            msg.delete();
            return;
        }

        // If the user has already voted with a different value, remove their previous
        // reaction from the message.
        if (votes[user.id]) {
            msg.reactions.resolve(votes[user.id]).users.remove(user.id)
        }
        // then update their vote in the object.
        votes[user.id] = reaction.emoji.name
    });

    collector.on('end', (collected, reason) => {
        // Handling deleted polls.
        if (collected.has('🚮')) {
            console.log(collected)
            enmap.remove(key, clownId, "polls")
            return channel.send(`The poll for ${clownMention} was deleted.`);
        }

        // Count votes
        let clown = 0
        let notClown = 0
        for (var id in votes) {
            if (votes[id] == '🤡') {
                clown++;
            } else {
                notClown++;
            }
        }

        // Decide and give verdict
        if (clown > notClown) {
            updateScores(clownId, enmap, key, channel, clownMention)
        } else {
            channel.send(`There has been a verdict! ${clownMention} was found not guilty of clownery.`)
        }
        enmap.remove(key, clownId, "polls")
    });
}

function updateScores (userId, enmap, key, channel, clownMention) {
    if (!enmap.has(key)) {
        return channel.send({
            content: "There is no clown season for this server logged. Logging poll results unsuccessful."
        })
    }

    const scores = enmap.get(key, "scores");
    const userIndex = scores.findIndex(score => userId == score.id);
    
    if (userIndex === -1) {
        enmap.push(key, {id: userId, val: 1}, "scores")
        return channel.send({
            content: `There has been a verdict! A new clown, ${clownMention}, has joined the board.`
        })
    }

    userVal = scores[userIndex].val
    scores.splice(userIndex, 1, {id: userId, val: ++userVal})
    return channel.send({
        content: `There has been a verdict! ${clownMention} has been found guilty of clownery.`
    })
}


// ============================================= //
//           ADMIN FUNCTION AREA                //
// ============================================= //


function adminEnd (bot, message, channel, args) {
    const enmap = bot.clownBoard;
    if (message.author.id != bot.config.ownerId) {
        return channel.send(`${message.author}, you are not authorized to carry out that action.`);
    }
    enmap.clear();
    return channel.send(`${message.author}, all clown seasons were cleared.`);
}