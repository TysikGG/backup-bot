const { ActionRowBuilder, StringSelectMenuBuilder,  EmbedBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
    name: "backups-list",
    description: "Список бекапов",
    run: async (client, interaction) => {

        const backupsArray = [];
        const backups = fs
          .readdirSync(`./backups`)
          .filter((file) => file.endsWith(".json"));

        backups.forEach(backup => {
            const backupData = backup.split('_')
            backupsArray.push({
                label: backupData[0] + ', ' + backupData[1].replace(/\./g, ":"),
                value: `load-${backupData[0] + '-' + backupData[1] + '-' + backupData[2]}`,
                description: `Выбрать \"${backup}\" для просмотра.`
            })
        })
        if (!backupsArray.length) {
            return interaction.reply({
                ephemeral: true,
                content: 'Список бэкапов пустой, создайте бэкап для вывода всех бэкапов'
            })
        }
        const row = new ActionRowBuilder()
        .setComponents([
            new StringSelectMenuBuilder()
                .setCustomId("backup-select")
                .setPlaceholder("Выберите резервное копирование")
                .addOptions(backupsArray)
        ])
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`\`ℹ Резервное копирование\`\n\n**Выберите интересующее резервное копирование.**`)
                    .setColor("Green")
            ],
            components: [row]
        })
    }
}
