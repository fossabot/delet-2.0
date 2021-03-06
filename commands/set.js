// This command is to modify/edit guild configuration. Perm Level 3 for admins
// and owners only. Used for changing prefixes and role names and such.

// Note that there's no "checks" in this basic version - no config "types" like
// Role, String, Int, etc... It's basic, to be extended with your deft hands!

// Note the **destructuring** here. instead of `args` we have :
// [action, key, ...value]
// This gives us the equivalent of either:
// const action = args[0]; const key = args[1]; const value = args.slice(2);
// OR the same as:
// const [action, key, ...value] = args;
const Command = require("../base/Command.js");

class Set extends Command {
  constructor(client) {
    super(client, {
      name: "set",
      description: "View or change settings for your server.",
      category: "System",
      usage: "set <view/get/edit> <key> <value>",
      guildOnly: true,
      aliases: ["setting", "settings"],
      permLevel: "Administrator"
    });
  }

  async run(message, [action, key, ...value], level) { // eslint-disable-line no-unused-vars

    // First we need to retrieve current guild settings
    const settings = message.settings;
    const defaults = this.client.settings.get("default");
  
    // Secondly, if a user does `-set edit <key> <new value>`, let's change it
    if (action === "edit") {
      if (!key) return message.reply("please specify a key to edit.");
      if (!settings[key]) return message.reply("this key does not exist in my settings.");
      if (value.length < 1) return message.reply("please specify a new value.");
    
      settings[key] = value.join(" ");

      this.client.settings.set(message.guild.id, settings);
      message.reply(`${key} was successfully edited to ${value.join(" ")}`);
    } else
  
    // Thirdly, if a user does `-set del <key>`, let's ask the user if they're sure...
    if (action === "del" || action === "reset") {
      if (!key) return message.reply("please specify a key to delete (reset).");
      if (!settings[key]) return message.reply("this key does not exist in my settings.");
      
      // Throw the 'are you sure?' text at them.
      const response = await this.client.awaitReply(message, `are you sure you want to reset \`${key}\` to the default \`${defaults[key]}\`?`);

      // If they respond with y or yes, continue.
      if (["y", "yes"].includes(response)) {

        // We reset the `key` here.
        delete settings[key];
        this.client.settings.set(message.guild.id, settings);
        message.reply(`${key} was successfully reset to default.`);
      } else

      // If they respond with n or no, we inform them that the action has been cancelled.
      if (["n","no","cancel"].includes(response)) {
        message.reply(`your setting for \`${key}\` remains at \`${settings[key]}\``);
      }
    } else
  
    // Using `-set get <key>` we simply return the current value for the guild.
    if (action === "get") {
      if (!key) return message.reply("please specify a key to view");
      if (!settings[key]) return message.reply("this key does not exist in my settings");
      message.reply(`the value of ${key} is currently ${settings[key]}`);
      
    } else {
      // Otherwise, the default action is to return the whole configuration in JSON format (to be prettified!);
      const array = [];
      Object.entries(settings).forEach(([key, value]) => {
        array.push(`${key}${" ".repeat(20 - key.length)}::  ${value}`); 
      });
      await message.channel.send(`= Current Guild Settings =
${array.join("\n")}`, {code: "asciidoc"});
    }
  }
}

module.exports = Set;