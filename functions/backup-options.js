const fs = require('fs');

async function backupOptions(guild) {
    const { parseChannel } = require('./require.js');
    if (guild.features.indexOf('COMMUNITY') == -1) {
        return {
            name: guild.name,
            iconURL: guild.iconURL({ dynamic: true }),
            mfaLevel: guild.mfaLevel,
            afkChannelId: parseChannel(await guild.channels.cache.get(guild.afkChannelId)),
            afkTimeout: guild.afkTimeout,
            verificationLevel: guild.verificationLevel
        }
    } else {
        return {
            name: guild.name,
            iconURL: guild.iconURL({ dynamic: true }),
            // description: guild.description,
            preferredLocale: guild.preferredLocale,
            rulesChannelId: parseChannel(await guild.channels.cache.get(guild.rulesChannelId)),
            publicUpdatesChannelId: parseChannel(await guild.channels.cache.get(guild.publicUpdatesChannelId)),
            mfaLevel: guild.mfaLevel,
            afkChannelId: parseChannel(await guild.channels.cache.get(guild.afkChannelId)),
            afkTimeout: guild.afkTimeout,
            verificationLevel: guild.verificationLevel
        }
    }

}

async function loadOptions(guild, options) {
    const fileName = options.file_name;
    const fileOptions = JSON.parse(fs.readFileSync("./backups/" + fileName)).options
    if (guild.features.indexOf('COMMUNITY') == -1) {
        guild.setName(fileOptions.name)
        guild.setIcon(fileOptions.icon)
        // guild.setMFALevel(fileOptions.mfaLevel)
        guild.setVerificationLevel(fileOptions.verificationLevel)
        guild.setAFKChannel(guild.channels.cache.find((c) => c.name === fileOptions.afkChannelId?.name))
        guild.setAFKTimeout(fileOptions.afkTimeout)
    } else {
        guild.setName(fileOptions.name)
        guild.setIcon(fileOptions.iconURL)
        // guild.setMFALevel(fileOptions.mfaLevel)
        guild.setVerificationLevel(fileOptions.verificationLevel)
        guild.setAFKChannel(guild.channels.cache.find((c) => c.name === fileOptions.afkChannelId?.name))
        guild.setAFKTimeout(fileOptions.afkTimeout)
        guild.setPublicUpdatesChannel(guild.channels.cache.find((c) => c.name === fileOptions.publicUpdatesChannelId?.name))
        guild.setRulesChannel(guild.channels.cache.find((c) => c.name === fileOptions.rulesChannelId?.name))
        // guild.setDescription(fileOptions.description)
        guild.setPreferredLocale(fileOptions.preferredLocale)
    }
}

module.exports = {
    backupOptions,
    loadOptions
}