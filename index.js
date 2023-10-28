const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require('discord.js');
const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
]});
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const { ls } = require('./functions/require.js')

const { loadSlashCommands } = require("./handlers/commands.js");
const { loadButtonsAccepts } = require("./handlers/buttonsAccepts.js");
const { createBackup } = require('./functions/require.js');
const options = require('./options.json');
const prefix = "+-";

client.slash = new Collection();
client.buttonAccepts = new Collection();

const row = new ActionRowBuilder()
.setComponents([
    new StringSelectMenuBuilder()
        .setCustomId("select-backup-category")
        .setPlaceholder("Укажите нужную опцию")
        .addOptions([
            {
                label: "Полный бекап",
                value: "select-load-full-backup",
                description: "Загрузить полный бекап сервера (удаление всех настроек)"
            },
            {
                label: "Бекап каналов",
                value: "select-load-channels-backup",
                description: "Загружает каналы с бекапа, удаляет текущие каналы"
            },
            {
                label: "Бекап ролей",
                value: "select-load-roles-backup",
                description: "Загружает роли с бекапа, удаляет текущие роли"
            },
            {
                label: "Бекап банов",
                value: "select-load-bans-backup",
                description: "Загружает баны с бекапа, снимает текущие баны"
            },
            {
                label: "Бекап эмодзи",
                value: "select-load-emojis-backup",
                description: "Загружает эмодзи с бекапа, с удалением старых"
            },
            {
                label: "Бекап настроек",
                value: "select-load-options-backup",
                description: "Загружает настройки сервера с бекапа, удаляя текущие настройки"
            },
            {
                label: "Бекап недостающих каналов",
                value: "select-load-missing-channels-backup",
                description: "Загружает только те каналы, которые отстуствуют на сервере"
            },
            {
                label: "Бекап списка каналов по именам",
                value: "select-load-list-channels-names",
                description: "Загружает каналы из указанных вами в списке"
            },                
            {
                label: "Бекап списка каналов по индексам",
                value: "select-load-list-channels-index",
                description: "Загружает каналы из указанных вами в списке"
            },
        ])
])

client.on('ready', async () => {
    console.log(`Бот ${client.user.tag} запустился`);
    loadSlashCommands(client);
    loadButtonsAccepts(client)
})

// обработчик текстовых сообщений
client.on("messageCreate", async message => {
    if (!message.content.startsWith(prefix)) return;
    let command = client.slash.get(message.content.replace(prefix, ""));
    if(!command) return;
    command.run(client, message);
})

// обработчик слеш-команд 
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    let command = client.slash.get(interaction.commandName);
    if(!command) return;
    command.run(client, interaction);
})

// обработчик кнопок-подтверждений
client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
    let command = client.buttonAccepts.get(interaction.customId)
    if (!command) return
    command.run(client, interaction)
})

// обработчик селект-меню
client.on('interactionCreate', interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId != 'backup-select') return;
    const data = interaction.values[0].split('-');
    const file = JSON.parse(fs.readFileSync(`./backups/${data[1]}_${data[2]}_${data[3]}`))

    const embed = new EmbedBuilder()
    .setDescription(`
        \`ℹ Резервное копирование\`\n\n
        **Название сервера: \`${file.options.name}\`\n
        ID сервера: \`${data[3].replace('.json', '')}\`\n
        Дата создания: \`${data[1] + ', ' + data[2].replace(/\./g, ":")}\`
    **`)
    interaction.reply({embeds: [embed], components: [row], fetchReply: true, ephemeral: true}).then(message => {
        ls.set(message.id, {
            filename: `${data[1]}_${data[2]}_${data[3]}`
        })
    })
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId != 'select-backup-category') return;
    let command = client.slash.get(interaction.values[0].replace('select-', ''));
    const intValue = interaction.values[0].replace('select-', '');
    if (!command && 
        intValue != "load-missing-channels-backup" && 
        intValue != "load-list-channels-names" &&
        intValue != "load-list-channels-index"
    ) return;
    
    const data = ls.get(interaction.message.id);
    if (!data) return interaction.reply({content: 'Срок действия данного взаимодействия истёк!', ephemeral: true})

    interaction.options = [ { name: 'filename', type: 3, value: data.filename } ] 

    if (interaction.values[0] == 'select-load-missing-channels-backup') { // различные опции, для которых необходимо передавать доп. аргументы
        interaction.options.push({name: "choise", type: 5, value: false})
        command = client.slash.get("load-channels-backup");
    } else if (interaction.values[0] == 'select-load-channels-backup') {
        interaction.options.push({name: "choise", type: 5, value: true})
    } else if (interaction.values[0] == 'select-load-list-channels-names') {
        const firstActionRow = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('first-list-data')
                .setLabel("Укажите имена каналов (через ;)")
                .setStyle('Short')
                .setRequired(true)
            );

        const modal = new ModalBuilder()
            .setCustomId('list-form')
            .setTitle('Укажите имена каналов')
            .addComponents(firstActionRow)

        return await interaction.showModal(modal);
    } else if (interaction.values[0] == 'select-load-list-channels-index') {
        const firstActionRow = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('first-list-data')
                .setLabel("Укажите номера каналов (через ;)")
                .setStyle('Short')
                .setRequired(true)
            );
        const modal = new ModalBuilder()
            .setCustomId('list-index-form')
            .setTitle('Укажите номера каналов')
            .addComponents(firstActionRow)

        return await interaction.showModal(modal);
    }
    
    command.run(client, interaction);

})

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return // обработка модальных окон для указания списка каналов
    if (interaction.customId == 'list-form' || interaction.customId == 'list-index-form') {
        const f1 = interaction.fields.getTextInputValue('first-list-data');
        const data = ls.get(interaction.message.id)
        interaction.options = [ { name: 'filename', type: 3, value: data.filename }, {name: "channels", type: 3, value: f1} ] 
        if (interaction.customId == 'list-form') {
            let command = client.slash.get("load-list-channels");
            command.run(client, interaction)
        } else if (interaction.customId == 'list-index-form') {
            let command = client.slash.get("load-list-channels-index");
            command.run(client, interaction)
        }
    }
})
schedule.scheduleJob('0 0 12 * * *', async function() {
    await createBackup(client.guilds.cache.get(options.backupServerId))
    console.log('Создан бекап!')
});

setInterval(() => {
    const backupDeleteTime = 7 * 24 * 60 * 60 * 1000;
    fs.readdirSync(path.resolve(__dirname, "backups")).filter(name => name.endsWith('.json')).forEach(async (file) => {
        const reqFile = require(path.resolve(__dirname, "backups", file.split(".json")[0]));

        const expTime = new Date(reqFile.createdTimestamp).setMilliseconds(backupDeleteTime);
        const checkDate = expTime - new Date();
        if (checkDate < 0) {
            try {
                fs.unlinkSync('./backups/' + file)
                console.log(`Бэкап \"${file}\" был удалён!`);
            } catch(e) {
                console.log(e);
            }
        }
    });
}, 5000);

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);

client.login('MTE2MDQ5MDU2NzIyMjk1NjA4Mg.GWBZKp.abqbqKdCywcE3JL-Pr2IPqLh_-rt9MxejomSfA');