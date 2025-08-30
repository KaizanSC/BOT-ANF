import { EmbedBuilder } from "discord.js";
import { getUser } from "../../database.js";

export default {
  name: "bank",
  description: "Veja seu saldo.",
  async execute(message) {
    const user = await getUser(message.author.id);

    const embed = new EmbedBuilder()
      .setTitle("💳 Saldo Bancário")
      .setDescription(`Seu saldo é: **${user.coins} moedas**`)
      .setColor("Blue")
      .setFooter({ text: "Use !shop para comprar itens." });

    message.reply({ embeds: [embed] });
  },
};

