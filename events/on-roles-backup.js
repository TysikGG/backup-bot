const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadRoles } = require('../functions/backup-roles.js');
let options = require("../options.json");

module.exports = {
    name: "on-roles-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        await interaction.deferReply()
        let errorMessage = await loadRoles(interaction.guild, options);
        let message = 'Успешно загружены роли! Ошибки: \n';
        for (error of errorMessage) message += error + "\n"; // добавление ошибок в сообщение
        await interaction.editReply(message);
    }
};