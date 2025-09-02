import { EmbedBuilder } from "discord.js";
import { User } from "../../utils/database.js";

export default {
  name: "roubar",
  description: "Roube moedas de outro jogador.",
  async execute(message) {
    const alvo = message.mentions.users.first();
    if (!alvo) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Erro")
            .setDescription("Mencione alguém para roubar!")
            .setColor("Red")
        ]
      });
    }

    if (alvo.id === message.author.id) {
      return message.reply("❌ Você não pode se roubar!");
    }

    try {
      // pega o ladrão e a vítima no banco
      const user = await User.findByPk(message.author.id);
      const vitima = await User.findByPk(alvo.id);

      if (!user || !vitima) {
        return message.reply("❌ Um dos jogadores não está registrado no sistema.");
      }

      const now = Date.now();
      const cooldown = 12 * 60 * 60 * 1000; // 12 horas
      const diff = now - (user.lastSteal || 0);

      if (diff < cooldown) {
        const restante = cooldown - diff;
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);

        return message.reply(
          `⏳ Você já roubou recentemente! Tente novamente em ${horas}h ${minutos}m.`
        );
      }

      if (vitima.coins <= 0) {
        return message.reply("❌ A vítima não tem moedas para roubar!");
      }

      // Chance de 5% de ser pego pela polícia
      const policiaChance = Math.random();
      if (policiaChance < 0.05) { // 5% de chance
        const perda = Math.floor(Math.random() * 101) + 100; // 100 a 200 moedas
        user.coins = Math.max(user.coins - perda, 0);
        await user.save();

        const embedPolicia = new EmbedBuilder()
          .setTitle("🚓 Polícia!")
          .setDescription(`${message.author} foi pego roubando e perdeu **${perda} ANFCoins**!`)
          .setColor("Red");

        return message.channel.send({ embeds: [embedPolicia] });
      }

      const porcentagem = Math.random() * 0.1; // até 10%
      const roubado = Math.floor(vitima.coins * porcentagem);

      // atualiza as coins no banco
      vitima.coins -= roubado;
      user.coins += roubado;
      user.lastSteal = now;

      await vitima.save();
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("🕵️ Roubo realizado!")
        .setDescription(`${message.author} roubou **${roubado} moedas** de ${alvo}!`)
        .setColor("DarkPurple");

      message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Erro no comando roubar:", err);
      message.reply("❌ Ocorreu um erro ao tentar roubar.");
    }
  }
};

