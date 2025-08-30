import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins, setDaily } from "../../database.js";

export default {
  name: "daily",
  description: "Pegue sua recompensa diária!",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const diff = now - user.lastDaily;

    if (diff < 86400000) {
      const hours = Math.floor((86400000 - diff) / 3600000);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⏳ Recompensa Diária")
            .setDescription(`Você já pegou seu daily! Tente novamente em ${hours}h.`)
            .setColor("Red"),
        ],
      });
    }

    const reward = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    await updateCoins(message.author.id, reward);
    await setDaily(message.author.id, now);

    const embed = new EmbedBuilder()
      .setTitle("💰 Recompensa Diária Recebida!")
      .setDescription(`Você recebeu **${reward} ANF Coins** no seu daily!`)
      .setColor("Gold")
      .setFooter({ text: "Volte amanhã para mais recompensas!" });

    message.reply({ embeds: [embed] });
  },
};

