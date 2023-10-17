const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const { loadEmojis } = require('../functions/backup-emojis.js');
const { loadBans } = require('../functions/backup-bans.js');
const { loadRoles } = require('../functions/backup-roles.js');
const { loadOptions } = require('../functions/backup-options.js');
const { loadChannelsBackup } = require('../functions/backup-channels.js');

let options = require("../options.json");
module.exports = {
    name: "on-full-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        await loadRoles(interaction.guild, options);
        await loadBans(interaction.guild, options);
        await loadEmojis(interaction.guild, options);
        await loadChannelsBackup(interaction.guild, options);
        await loadOptions(interaction.guild, options);
        // await interaction.reply('Успешно загружен полный бекап!')
    }
};