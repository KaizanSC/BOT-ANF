import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins } from "../../utils/database.js";

export default {
  name: "raspadinha",
  description: "Teste sua sorte na raspadinha!",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const cooldown = 12 * 60 * 60 * 1000;
    const diff = now - (user.lastScratch || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return message.reply(`⏳ Você já jogou a raspadinha! Tente novamente em ${horas}h ${minutos}m.`);
    }

    const premios = [
      { texto: "Nada... que azar! 😭", valor: 0 },
      { texto: "Ganhou 10 ANF Coins!", valor: 10 },
      { texto: "Ganhou 50 ANF Coins!", valor: 50 },
      { texto: "Ganhou 100 ANF Coins!", valor: 100 }
    ];

    const premio = premios[Math.floor(Math.random() * premios.length)];
    if (premio.valor > 0) await updateCoins(message.author.id, premio.valor);

    user.lastScratch = now;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🎰 Raspadinha!")
      .setDescription(premio.texto)
      .setColor(premio.valor > 0 ? "Green" : "Red");

    message.reply({ embeds: [embed] });
  }
};

