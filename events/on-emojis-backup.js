const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadEmojis } = require('../functions/backup-emojis.js');
let options = require("../options.json");

module.exports = {
    name: "on-emojis-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        await interaction.deferReply()
        await loadEmojis(interaction.guild, options);
        await interaction.editReply('Успешно загружены эмодзи!');
    }
};