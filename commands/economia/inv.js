import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../database.js"; // importa do nosso database.js

export default {
  name: "inv",
  description: "Mostra seus itens comprados.",
  async execute(message) {
    try {
      const inv = await getInventory(message.author.id); // agora é assíncrono

      if (inv.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("📦 Inventário vazio")
              .setDescription("Você ainda não comprou nenhum item.")
              .setColor("Red"),
          ],
        });
      }

      const lista = inv.map(i => `- ${i}`).join("\n"); // i já é string (nome do item)

      const embed = new EmbedBuilder()
        .setTitle(`📦 Inventário de ${message.author.username}`)
        .setDescription(lista)
        .setColor("Blue")
        .setFooter({ text: "Use !shop para ver os itens disponíveis." });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar comando 'inv':", error);
      message.reply("❌ Ocorreu um erro ao carregar seu inventário.");
    }
  },
};
