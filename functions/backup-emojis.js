const fs = require('fs');

async function backupEmojis(guild) {
    let emojis = []
    await guild.emojis.cache.forEach(async (emoji) => {
        const emojiData = {
            name: emoji.name,
            url: emoji.url
        };
        emojis.push(emojiData)
    });
    return emojis
}

async function loadEmojis(guild, options) {
    const fileName = options.file_name;
    await guild.emojis.cache.forEach(emoji => emoji.delete());
    const file = JSON.parse(fs.readFileSync("./backups/" + fileName));
    file.emojis.forEach((emoji) => {
        if (emoji.url) {
            guild.emojis.create({
                name: emoji.name,
                attachment: emoji.url
            });
        }
    });
}

module.exports = {
    backupEmojis,
    loadEmojis
}