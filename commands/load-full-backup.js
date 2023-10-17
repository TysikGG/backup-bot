const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const accept = new ButtonBuilder()
    .setCustomId('on-full-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

module.exports = {
    name: "load-full-backup",
    description: "Загрузить backup-копию всего сервера",
    options:[{
        name: "filename",
        description: "Укажите имя файла (Например: example.js)",
        type: 3,
        required: true
    }],

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return;
        interaction.reply({
            content: 'Вы действительно хотите загрузить backup-копию сервера? \nВНИМАНИЕ!!! **ВСЕ** настройки сервера будут удалены и заменены! (роли, баны, каналы, настройки и т.п.)', 
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        }).then(message => {
            ls.set(message.id, [interaction.user, interaction.options[0].value]);
        })
    }
}