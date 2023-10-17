const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const accept = new ButtonBuilder()
    .setCustomId('on-list-channels-backup')
    .setLabel('Подтвердить')
    .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder()
    .addComponents(accept);

module.exports = {
    name: "load-list-channels-index",
    description: "Загрузить backup-копию каналов",
    options:[
        {
            name: "filename",
            description: "Укажите имя файла (Например: example.js)",
            type: 3,
            required: true
        },
        {
            name: "channels",
            description: "Укажите список каналов для восстановления через ; (например: channelName1;channelName2)",
            type: 3,
            required: true
        }
    ],

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return;
        let validChannels = [];
        let channelsList = "";
        const channelsNames = interaction.options[1].value.split(';');
        const fileName = interaction.options[0].value;
        if (channelsNames.includes("")) return interaction.reply('Ошибка в указании данных! Укажите список имён через ; (например: channelName1;channelName2)');
        const file = require('../backups/' + fileName);
        for (c of channelsNames) {
            for (channels of file.channels) {
                if (channels.name == c) validChannels.push(channels);
            }
        }

        for (index of channelsNames) validChannels.push(file.channels[index]);
        for (elements of validChannels) channelsList += `${elements.name}; `;

        interaction.reply({
            content: 'Вы действительно хотите загрузить backup-копию каналов? Список каналов: \n' + channelsList, 
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        }).then(message => {
            ls.set(message.id, [interaction.user, fileName, validChannels]);
        })
    }
}