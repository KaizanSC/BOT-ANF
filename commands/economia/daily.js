import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins, setDaily } from "../../utils/database.js";

export default {
  name: "daily",
  description: "Pegue suas ANF Coins diárias",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24h
    const diff = now - (user.lastDaily || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return message.reply(`⏳ Você já pegou seu daily! Tente novamente em ${horas}h ${minutos}m.`);
    }

    const reward = Math.floor(Math.random() * 100) + 50; // 50-150 moedas
    await updateCoins(message.author.id, reward);
    await setDaily(message.author.id, now);

    const embed = new EmbedBuilder()
      .setTitle("💰 Daily coletado!")
      .setDescription(`${message.author}, você recebeu **${reward} ANF Coins**!`)
      .setColor("Green");

    message.reply({ embeds: [embed] });
  }
};
