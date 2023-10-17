const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const accept = new ButtonBuilder()
    .setCustomId('on-emojis-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

module.exports = {
    name: "load-emojis-backup",
    description: "Загрузить backup-копию эмодзи",
    options:[{
        name: "filename",
        description: "Укажите имя файла (Например: example.js)",
        type: 3,
        required: true
    }],

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return;
        interaction.reply({
            content: 'Вы действительно хотите загрузить backup-копию эмодзи? \nВНИМАНИЕ!!! Текущие эмодзи будут удалены', 
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        }).then(message => {
            ls.set(message.id, [interaction.user, interaction.options[0].value]);
        })
    }
}