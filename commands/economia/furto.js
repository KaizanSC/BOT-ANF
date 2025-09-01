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
      const diff = now - (user.lastSteal || 0);

      if (diff < 86400000) {
        const horas = Math.floor((86400000 - diff) / 3600000);
        return message.reply(`⏳ Você já roubou hoje! Tente novamente em ${horas}h.`);
      }

      if (vitima.coins <= 0) {
        return message.reply("❌ A vítima não tem moedas para roubar!");
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
