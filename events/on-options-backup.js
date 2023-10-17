const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadOptions } = require('../functions/backup-options.js');
let options = require("../options.json");

module.exports = {
    name: "on-options-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        await interaction.deferReply()
        await loadOptions(interaction.guild, options);
        await interaction.editReply('Успешно загружены настройки!')
    }
};