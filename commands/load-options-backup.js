const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const accept = new ButtonBuilder()
    .setCustomId('on-options-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

module.exports = {
    name: "load-options-backup",
    description: "Загрузить backup-копию настроек сервера",
    options:[{
        name: "filename",
        description: "Укажите имя файла (Например: example.js)",
        type: 3,
        required: true
    }],

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return;
        interaction.reply({
            content: 'Вы действительно хотите загрузить backup-копию опций? \nВНИМАНИЕ!!! Текущие опции (такие как аватарка и название сервера, а также АФК канал) будут отчищены!', 
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        }).then(message => {
            ls.set(message.id, [interaction.user, interaction.options[0].value])
        })
    }
}