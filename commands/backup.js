const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js')
const { ls } = require('../functions/require.js');
const { checkAdminPermissions } = require('../functions/permissions.js');

const create = new ButtonBuilder()
    .setCustomId('create-backup')
    .setLabel('Создать')
    .setStyle(ButtonStyle.Success);
const list = new ButtonBuilder()
    .setCustomId('backups-list')
    .setLabel('Список')
    .setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder()
    .addComponents(create)
    .addComponents(list)

const embed1 = new EmbedBuilder()
    .setDescription(`\`ℹ Резервное копирование\`\n\n**Меню бекапов**`)
    .setColor("Green")

module.exports = {
    name: "backup",
    description: "Открыть backup-меню",

    run: async (client, interaction) => {
        if(!checkAdminPermissions(interaction.member)) return

        interaction.reply({
            embeds: [embed1],
            components: [row], 
            fetchReply: true, 
            ephemeral: true
        })
    }
}