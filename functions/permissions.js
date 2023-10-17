const { PermissionsBitField } = require('discord.js');

function checkAdminPermissions(member) {
    if (!member) return false;
    if(!member.permissions?.has(PermissionsBitField.Flags.Administrator)) return false;
    return true;
}
module.exports = {
    checkAdminPermissions
}