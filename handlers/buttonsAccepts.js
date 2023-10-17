async function loadButtonsAccepts(client) {
    const fs = require("fs");
    const commandFiles = fs
      .readdirSync(`./events`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`../events/${file}`);
      if (command.name) {
        client.buttonAccepts.set(command.name, command);
      }
    }
  }
  
module.exports = {
  loadButtonsAccepts,
};