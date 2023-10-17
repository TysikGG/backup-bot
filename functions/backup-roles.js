const fs = require("fs");

async function backupRoles(guild) {
    const roles = [];
    guild.roles.cache
        .filter((role) => !role.managed)
        .sort((a, b) => b.position - a.position)
        .forEach((role) => {
        const roleData = {
            name: role.name,
            color: role.hexColor,
            hoist: role.hoist,
            permissions: role.permissions.bitfield.toString(),
            mentionable: role.mentionable,
            position: role.position,
            isEveryone: guild.id === role.id
        };
        roles.push(roleData);
    });
    return roles;
}

async function loadRoles(guild, options) {
    const fileName = options.file_name;
    let errorsMessages = []
    for (role of guild.roles.cache) {
        role = role[1]
        if (guild.id !== role.id) await role.delete().catch(res => {
            const errorMessage = `Удаление роли ${role.name} вызвало ошибку: ${res.message}!`
            console.log(errorMessage)
            errorsMessages.push(errorMessage)
        })
    };
    const file = JSON.parse(fs.readFileSync("./backups/" + fileName));
    for (roleData of file.roles) {
        if (roleData.isEveryone) {
            guild.roles.cache.get(guild.id).edit({
                name: roleData.name,
                color: roleData.color,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            })
        }
        else {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            }).catch(res => {
                const errorMessage = `Создание роли ${role.name} вызвало ошибку: ${res.message}!`
                console.log(errorMessage)
                errorsMessages.push(errorMessage)
            })
        }
    };
    return errorsMessages;
}


module.exports = {
    backupRoles,
    loadRoles
}