const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadBans } = require('../functions/backup-bans.js');
let options = require("../options.json");

module.exports = {
    name: "on-bans-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        await loadBans(interaction.guild, options);
        await interaction.update({content: 'Баны успешно загружены!', components: []});
    }
}