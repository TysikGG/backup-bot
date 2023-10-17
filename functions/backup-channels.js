const djs = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

const accept = new ButtonBuilder()
    .setCustomId('on-some-channels-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

async function backupChannels(guild) {
    const channels = await guild.channels.cache.sort(async function (a, b) {
        return a.position - b.position;
    }).map(c => {
        const channel = {
            id: c.id,
            name: c.name,
            type: c.type,
            topic: c.topic,
            nsfw: c.nsfw,
            position: c.position,
            parent: c.parent,
            reason: c.reason,
            rateLimitPerUser: c.rateLimitPerUser,
            permissions: fetchChannelPermissions(c)
        };
        if (c.parent) channel.parent = c.parent;
        return channel;
    });
    return channels;
}

async function loadChannelsBackup(guild, options, interaction) {
    let errors = []
    const fileName = options.file_name;
    const ls = require('local-storage');
    const file = JSON.parse(fs.readFileSync("./backups/" + fileName));
    if (options.full_backup) {
        await guild.channels.cache.forEach(channel => {
            channel.delete().catch(e => {
                console.log(e.text);
                errors.push(e.text)
            })
        });
        const categories = [];
        for (const c of file.channels) { // отбирает категории, записывает их старый ид и создаёт их
            if (c.type == 4) {
                await guild.channels.create({
                    name: c.name,
                    type: c.type,
                    position: c.position,
                }).then(async newC => { 
                    const finalPermissions = [];
                    c.permissions.forEach((perm) => {
                        const role = guild.roles.cache.find((r) => r.name === perm.name);
                        if (role) {
                            finalPermissions.push({
                                id: role.id,
                                allow: BigInt(perm.allow),
                                deny: BigInt(perm.deny)
                            });
                        }
                    });
                    await newC.permissionOverwrites.set(finalPermissions)
                    newC.oldId = c.id;
                    categories.push(newC);
                    let mapCategories1 = interaction.guild.channels.cache.filter((c) => c.type != 4);
                    let allChannels = Array.from(mapCategories1, ([name, value]) => ({ name, value }));
                    for (channel of allChannels) {
                        for (const backupChannel of file.channels) {
                            if (backupChannel.name == channel.value.name) {
                                if (backupChannel.parent.name == newC.name) {
                                    channel.value.setParent(newC.id);
                                }
                            }
                        }
                    }
                }).catch(e => {
                    errors.push(e.text)
                });
            };
        };
        for (const c of file.channels) { // создаёт каналы, находя родителя, исходя из старого ид категории
            if (c.type != 4) {
                if (c.parent) {
                    for (let i = 0; i < categories.length; i++) {
                        if (c.parent.id == categories[i].oldId) {
                            c.parent = categories[i];
                        }
                    }
                }
                const channel = guild.channels.cache.find((ch) => ch.id === c.id);
                if (!channel) {
                    await guild.channels.create({
                        name: c.name,
                        type: c.type,
                        topic: c.topic,
                        nsfw: c.nsfw,
                        position: c.position,
                        parent: c.parent,
                        rateLimitPerUser: c.rateLimitPerUser,
                        reason: "Создание канала с backup копии",
                    }).then(async ch => {
                        // console.log(c.parent)
                        const finalPermissions = [];
                        c.permissions.forEach((perm) => {
                            const role = guild.roles.cache.find((r) => r.name === perm.name);
                            if (role) {
                                finalPermissions.push({
                                    id: role.id,
                                    allow: BigInt(perm.allow),
                                    deny: BigInt(perm.deny)
                                });
                            }
                        });
                        await ch.permissionOverwrites.set(finalPermissions)
                    })
                    .catch(e => {
                        errors.push(e.text)
                    })
                } else {
                    errors.push(`Канал ${c.name} уже существует, возможно, произошла ошибка, поэтому его восстановление не требуется`)
                }
            };
        };
    } else {
        let channelsList = file.channels
        let GuildChannels = [];
        guild.channels.cache.forEach(channel => {GuildChannels.push(channel)}) // получаем все каналы сервера
        for (channel of GuildChannels) {
            for (let i = 0; i < channelsList.length; i++) {
                if (channelsList[i].name == channel.name) {
                    channelsList.splice(i, 1) // удаляем из списка те каналы, которые уже есть
                }
            }
        }
        console.log(channelsList)
        let channelsText = '\n'
        for (existChannel of channelsList) channelsText += existChannel.name + '; ';
        interaction.channel.send({
            content: 'Вы действительно хотите загрузить данный список каналов: ' + channelsText, 
            components: [row], 
            fetchReply: true
        }).then(message => {
            ls.set(message.id, [interaction.user, channelsList])
        })
    }

    for (err of errors) console.log(err)
    return errors
};

function fetchChannelPermissions(channel) {
    const permissions = [];
    channel.permissionOverwrites.cache
        .filter((p) => p.type === djs.OverwriteType.Role)
        .forEach((perm) => {
        const role = channel.guild.roles.cache.get(perm.id);
        if (role) {
            permissions.push({
                name: role.name,
                allow: perm.allow.bitfield.toString(),
                deny: perm.deny.bitfield.toString()
            });
        }
    });
    return permissions;
}

module.exports = {
    loadChannelsBackup,
    backupChannels
};
