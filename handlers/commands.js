async function loadSlashCommands(client) {
    const fs = require("fs");
    const commandFiles = fs
      .readdirSync(`./commands`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      if (command.name) {
        client.slash.set(command.name, command);
        if (command.name == "backup") {
          client.application.commands.create(command) // создаёт только команду бекапа
        }
      }
    }
  }
  
module.exports = {
  loadSlashCommands,
};