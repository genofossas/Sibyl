# Sibyl
> JavaScript discord bot using `enmap` and `Discord.js`.

## Introduction

About one year ago (May 2019), I created a discord bot to better understand JavaScript. It was a great first project, but there was a lot I wanted to improve on after taking on two internships with projects written in JavaScript. This is the culmination of that desire. This project, much like its predecessor [GlitchBot](https://github.com/genovevafossas/GlitchBot), uses the command/event loading structure that is found in [An Idiot's Guide](https://anidiots.guide/first-bot/your-first-bot). This structure uses the npm package [enmap](https://enmap.evie.dev/), which allows for persistent storage of data locally. Enmap is most useful for the `daysSince` command, but is also useful for associating functions with certain command names on the bot object itself.

## Dependencies

* `better-sqlite3`
    * Associated with `enmap` - used for map persistence.
* `discord.js`
* `enmap`
    * Chosen over vanilla JavaScript maps due to the added persistence functionality
* `eslint`

## Functionality
The bot currently has 3 commands:
* `daysSince`
    * Creates and manages an object that represents a board tracking how many days since something has happened. Dates are tracked by members on the object representing the board. Options for this command are as follows:
        * `new <title>` - Create a new board with the title given by the user. By default, there are no users on the board upn creation.
        * `join <date> <title>` - Join the `<title>` board with `<date>`. The date should be in the format specified by JavaScript's `Date` object. (`yyyy-mm-dd`)
        * `update <date> <title>` - Update your listing on `<title>` with `<date>`.
        * `leave <title>` - Leave the board called `<title>`.
        * `delete <title>` - Delete the board called `<title>`. This can only be done by the creator of the board.
        * `view <title>` - Displays the board in an enmap. The number of days elapsed is calculated upon each view.
* `help` - Displays information about each command and their usage. Includes some sub-help pages.
* `info`- Displays information about the bot.

## Usage Guide
To begin using this bot, make sure to create a file called `config.json` under `/src/`. There is an example file called `example-config.json` which you can rename to just `config.json`. This file includes the prefix for the bot (what you type before a command), the owner's id (used for some admin options built in to the daysSince command), and the token for your bot (from the Discord developer portal). It should roughly look like this:

```json
    {
        "ownerId": "your-owner-id",
        "prefix": "!",
        "token": "your-token"
    }
```

Once this file is created, you can run the bot with `npm run start`. Make sure to run `npm install` before you do so to install dependencies. I have also included a cleaning script, run with `npm run clean`, to delete `node_modules/` for you.

There is also eslint configured to guide code style.

## Areas for Improvement, Future Features

#### Areas for Improvement:

1) As of right now, the way members of a `daysSince` board is handled is a little inefficient. I'm using the built in `push()` function of `enmap` to add users to the array of members, but each time I want to verify if someone is in the array or not (to avoid duplicates) I have to use the JavaScript built-in `Array.prototype.find()`, which will be inefficient for long member lists. This is acceptable performance inefficiency for smaller servers, but can cause an issue for bigger ones. To remove users, it also uses `Array.prototype.filter()`, which has similar considerations.
    * One of my proposed solutions was using a vanilla Map from JavaScript for the users. Members would be stored with their id as the key, and the date as the value. However, there is an issue with this: the sqlite database cannot preserve maps as Map objects. This means that I would have to take the stringified list and make it a map again each time I want to modify data, which would include in the `update`, `leave`, and `join` functions (at the very least). This may not see a significant performance improvement over the current implementation, but I am currently looking into verifying if it will or not.
2) Minimize the amount of times that a Date object must be constructed. Since the sqlite database cannot maintain objects, it may be worthwhile to see if there is a more efficient (and supported) way to verify a date is valid. Using Date.parse() is generally discouraged. From the [MDN web docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse):
> It is not recommended to use `Date.parse` as until ES5, parsing of strings was entirely implementation dependent. There are still many differences in how different hosts parse date strings, therefore date strings should be manually parsed (a library can help if many different formats are to be accommodated).
