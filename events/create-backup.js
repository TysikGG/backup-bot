const { checkAdminPermissions } = require('../functions/permissions.js');
const { createBackup } = require('../functions/require.js');

module.exports = {
    name: "create-backup",
    description: "Создать backup-копию сервера",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        await createBackup(interaction.guild);
        interaction.reply(`Успешно создан (перезаписан) бекап!`);
    }
}
