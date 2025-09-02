import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins } from "../../utils/database.js";

export default {
  name: "roubar",
  description: "Roube moedas de outro jogador",
  async execute(message) {
    const alvo = message.mentions.users.first();
    if (!alvo) return message.reply("❌ Mencione alguém para roubar!");
    if (alvo.id === message.author.id) return message.reply("❌ Você não pode se roubar!");

    const user = await getUser(message.author.id);
    const vitima = await getUser(alvo.id);
    const now = Date.now();
    const cooldown = 12 * 60 * 60 * 1000;
    const diff = now - (user.lastSteal || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);
      return message.reply(`⏳ Você já roubou recentemente! Tente novamente em ${horas}h ${minutos}m.`);
    }

    // Chance da polícia (5%)
    if (Math.random() < 0.05) {
      const perda = Math.floor(Math.random() * 101) + 100; // 100-200 moedas
      user.coins = Math.max(0, user.coins - perda);
      user.lastSteal = now;
      await user.save();
      return message.reply(`🚓 A polícia te pegou! Você perdeu **${perda} ANF Coins**.`);
    }

    const porcentagem = Math.random() * 0.1;
    const roubado = Math.floor(vitima.coins * porcentagem);

    vitima.coins -= roubado;
    user.coins += roubado;
    user.lastSteal = now;
    await vitima.save();
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🕵️ Roubo realizado")
      .setDescription(`${message.author} roubou **${roubado} ANF Coins** de ${alvo}!`)
      .setColor("DarkPurple");

    message.reply({ embeds: [embed] });
  }
};


