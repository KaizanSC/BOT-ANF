import { EmbedBuilder } from "discord.js";
import { buyRPGItem } from "../../utils/database.js";

export default {
  name: "rpg-buy",
  description: "Compre um item na loja RPG.",
  execute(message, args) {
    if (!args.length) {
      return message.reply("❌ Uso correto: `!rpg-buy <nome do item>`");
    }

    const itemName = args.join(" ");
    const result = buyRPGItem(message.author.id, itemName);

    const embed = new EmbedBuilder()
      .setTitle(result.success ? "✅ Compra concluída" : "❌ Falha na compra")
      .setDescription(result.message)
      .setColor(result.success ? "Green" : "Red");

    message.reply({ embeds: [embed] });
  }
};
