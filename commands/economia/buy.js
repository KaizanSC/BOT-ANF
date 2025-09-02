import { EmbedBuilder } from "discord.js";
import { buyItem, getShop } from "../../utils/database.js";

export default {
  name: "buy",
  description: "Compre itens na loja",
  async execute(message, args) {
    if (!args[0]) {
      const shop = await getShop();
      const lista = shop.map(i => `**${i.item}** — ${i.price} moedas`).join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🛒 Loja")
        .setDescription(lista || "A loja está vazia!")
        .setColor("Blue");
      return message.reply({ embeds: [embed] });
    }

    const itemName = args.join(" ");
    const result = await buyItem(message.author.id, itemName);

    const embed = new EmbedBuilder()
      .setTitle(result.success ? "✅ Compra realizada" : "❌ Erro")
      .setDescription(result.message)
      .setColor(result.success ? "Green" : "Red");

    message.reply({ embeds: [embed] });
  }
};
