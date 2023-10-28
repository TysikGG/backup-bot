var ls = require('local-storage');
const fs = require('fs');

const { backupChannels } = require('./backup-channels.js');
const { backupEmojis } = require('./backup-emojis.js');
const { backupBans } = require('./backup-bans.js');
const { backupRoles } = require('./backup-roles.js');
const { backupOptions } = require('./backup-options.js');

async function createBackup(guild) {
    // загрузка данных для бекапа
    channels = await backupChannels(guild);
    emojis = await backupEmojis(guild);
    bans = await backupBans(guild);
    roles = await backupRoles(guild);
    options = await backupOptions(guild);

    const file = {
        createdTimestamp: Date.now(),
        channels: channels,
        roles: roles,
        bans: bans,
        emojis: emojis,
        options: options
    };
    var date = new Date().toLocaleDateString();
    var time = new Date().toLocaleTimeString().toString().replace(/:/g, '.');
    await fs.writeFileSync(`./backups/${date + "_" + time + "_" + guild.id}.json`, JSON.stringify(file, null, 2), function (err) {if (err) return false}); // запись файла
}

function parseChannel(channel) {
    if (!channel) return null
    return {
        name: channel.name,
        type: channel.type,
        topic: channel.topic,
        nsfw: channel.nsfw,
        position: channel.position,
        parent: channel.parent,
        rateLimitPerUser: channel.rateLimitPerUser,
    }
}

module.exports = {
    ls, createBackup, parseChannel
}

