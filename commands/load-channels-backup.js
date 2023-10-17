const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const accept = new ButtonBuilder()
    .setCustomId('on-channels-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

module.exports = {
    name: "load-channels-backup",
    description: "Загрузить backup-копию сервера",
    options:[
        {
            name: "filename",
            description: "Укажите имя файла (Например: example.js)",
            type: 3,
            required: true
        },
        {
            name: "choise",
            description: "Если true - полный бекап с удаление, если false - бекап отсуствующих каналов",
            type: 5,
            required: true
        }
    ],

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return
        interaction.reply({
            content: 'Вы действительно хотите загрузить backup-копию каналов? \nВНИМАНИЕ!!! Текущие каналы будут удалены', 
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        }).then(message => {
            ls.set(message.id, [interaction.user, interaction.options[0].value, interaction.options[1].value])
        })
    }
}