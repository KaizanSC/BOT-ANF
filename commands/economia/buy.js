import { EmbedBuilder } from "discord.js";
import { buyItem } from "../../database.js"; // importa do nosso database.js

export default {
  name: "buy",
  description: "Compra um item da loja.",
  async execute(message, args) {
    try {
      if (!args.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Compra inválida")
              .setDescription("Digite o nome do item que deseja comprar.")
              .setColor("Red"),
          ],
        });
      }

      const itemName = args.join(" ");
      const result = await buyItem(message.author.id, itemName); // await para Postgres

      const embed = new EmbedBuilder()
        .setTitle(result.success ? "✅ Compra realizada!" : "❌ Falha na compra")
        .setDescription(result.message)
        .setColor(result.success ? "Green" : "Red");

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar comando 'buy':", error);
      message.reply("❌ Ocorreu um erro ao tentar comprar o item.");
    }
  },
};
