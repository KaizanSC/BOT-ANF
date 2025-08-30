import { EmbedBuilder } from "discord.js";
import { getUser } from "../../database.js"; // importa do nosso database.js

export default {
  name: "bank", // Comando aceita tanto !balance quanto !bank
  description: "Veja seu saldo.",
  async execute(message) {
    try {
      const user = await getUser(message.author.id); // await pois é assíncrono

      const embed = new EmbedBuilder()
        .setTitle("💳 Saldo Bancário")
        .setDescription(`Seu saldo é: **${user.coins} moedas**`)
        .setColor("Blue")
        .setFooter({ text: "Use !shop para comprar itens." });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar comando 'bank':", error);
      message.reply("❌ Ocorreu um erro ao verificar seu saldo.");
    }
  },
};
