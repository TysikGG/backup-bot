const fs = require('fs');
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadOptions } = require('../functions/backup-options.js');
let options = require("../options.json");

module.exports = {
    name: "on-list-channels-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        let errors = []
        options.file_name = ls.get(interaction.message.id)[1];
        options.channels = ls.get(interaction.message.id)[2];

        const file = JSON.parse(fs.readFileSync("./backups/" + options.file_name));

        channels = options.channels;
        let mapCategories = interaction.guild.channels.cache.filter((c) => c.type == 4);
        let categories = Array.from(mapCategories, ([name, value]) => ({ name, value }));
        for (const c of channels) { // отбирает категории, записывает их старый ид и создаёт их
            if (c.type == 4) {
                await interaction.guild.channels.create({
                    name: c.name,
                    type: c.type,
                    position: c.position,
                }).then(async newC => { 
                    const finalPermissions = [];
                    c.permissions.forEach((perm) => {
                        const role = interaction.guild.roles.cache.find((r) => r.name === perm.name);
                        if (role) {
                            finalPermissions.push({
                                id: role.id,
                                allow: BigInt(perm.allow),
                                deny: BigInt(perm.deny)
                            });
                        }
                    });
                    await newC.permissionOverwrites.set(finalPermissions)
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
                    console.log(e.text)
                });
            };
        };
        for (const c of channels) { // создаёт каналы, находя родителя, исходя из старого ид категории
            if (c.type != 4) {
                if (c.parent) {
                    for (let i = 0; i < categories.length; i++) {
                        if (c.parent.name == categories[i].value?.name) {
                            categories[i].value.id = categories[i].name;
                            c.parent = categories[i].value;
                        }
                    }
                }
                const channel = interaction.guild.channels.cache.find((ch) => ch.id === c.id);
                if (!channel) {
                    await interaction.guild.channels.create({
                        name: c.name,
                        type: c.type,
                        topic: c.topic,
                        nsfw: c.nsfw,
                        position: c.position,
                        parent: c.parent,
                        rateLimitPerUser: c.rateLimitPerUser,
                        reason: "Создание канала с backup копии",
                    }).then(async ch => {
                        const finalPermissions = [];
                        c.permissions.forEach((perm) => {
                            const role = interaction.guild.roles.cache.find((r) => r.name === perm.name);
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
                        console.log(e.text)
                    })
                } else {
                    const error = `Канал ${c.name} не был удалён, поэтому его восстановление не требуется`;
                    errors.push(error)
                    console.log(error)
                }
            };
        };
        await interaction.update({content: 'Каналы успешно загружены!', components: []});
    }
};