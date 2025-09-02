import { EmbedBuilder } from "discord.js";
import { buyItem, getShop } from "../../utils/database.js";

export default {
  name: "buy",
  description: "Compra itens da loja",
  async execute(message, args) {
    if (!args.length) return message.reply("❌ Use: `!buy {item}`");

    const itemName = args.join(" ");
    const result = await buyItem(message.author.id, itemName);

    const embed = new EmbedBuilder()
      .setTitle(result.success ? "🛒 Compra realizada!" : "❌ Erro")
      .setDescription(result.message)
      .setColor(result.success ? "Green" : "Red");

    message.channel.send({ embeds: [embed] });
  }
};

