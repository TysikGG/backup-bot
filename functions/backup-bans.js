const fs = require('fs')

async function backupBans(guild) {
    const bans = [];
    const bansData = await guild.bans.fetch();
    bansData.forEach((ban) => {
        bans.push({
            id: ban.user.id,
            reason: ban.reason
        });
    });
    return bans;
}

async function loadBans(guild, options) {
    const fileName = options.file_name;
    bans = await guild.bans.fetch();
    bans.forEach((userBan) => guild.members.unban(userBan.user.id));
    const file = JSON.parse(fs.readFileSync("./backups/" + fileName));
    await file.bans.forEach((ban) => {
        guild.members.ban(ban.id, {
            reason: ban.reason
        });
    });
}

module.exports = {
    backupBans,
    loadBans
}