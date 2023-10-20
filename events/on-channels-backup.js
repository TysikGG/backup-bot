const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');
const { loadChannelsBackup } = require('../functions/backup-channels.js');
let options = require("../options.json");

module.exports = {
    name: "on-channels-backup",
    run: async (client, interaction) => {
        if (!checkAdminPermissions(interaction.member)) return;
        if (ls.get(interaction.message.id)[0].id != interaction.user.id) return;
        options.file_name = ls.get(interaction.message.id)[1];
        options.full_backup = ls.get(interaction.message.id)[2];
        await loadChannelsBackup(interaction.guild, options, interaction);
        // await interaction.channel.send('Успешно загружены каналы!').catch(console.log)
    }
};