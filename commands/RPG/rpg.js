import { EmbedBuilder } from "discord.js";
import { getRPGUser, getInventory } from "../../utils/database.js";

export default {
  name: "rpg",
  description: "Sistema RPG",
  async execute(message, args) {
    const user = await getRPGUser(message.author.id);

    if (!args.length || args[0].toLowerCase() === "perfil") {
      const embed = new EmbedBuilder()
        .setTitle(`🧙 Perfil RPG de ${message.author.username}`)
        .setColor("Blue")
        .addFields(
          { name: "🪙 RPGCoins", value: `${user.coins}`, inline: true }
        )
        .setFooter({ text: "Use !rpg inv para ver seu inventário" });

      message.reply({ embeds: [embed] });
    }

    if (args[0]?.toLowerCase() === "inv") {
      const inventory = await getInventory(message.author.id);
      if (!inventory.length) {
        return message.reply("📦 Seu inventário está vazio!");
      }

      const invEmbed = new EmbedBuilder()
        .setTitle(`📦 Inventário de ${message.author.username}`)
        .setDescription(inventory.map(i => `- ${i}`).join("\n"))
        .setColor("Green");

      message.reply({ embeds: [invEmbed] });
    }
  }
};
