import { EmbedBuilder } from "discord.js";
import { User } from "../database.js"; // importa o modelo User do Postgres

export default {
  name: "top",
  description: "Mostra o ranking de moedas.",
  async execute(message) {
    console.log("Comando 'top' executado.");

    try {
      // Buscar os 10 usuários com mais coins
      const top = await User.findAll({
        order: [["coins", "DESC"]],
        limit: 10,
      });

      console.log("Resultado da consulta ao banco:", top.map(u => u.toJSON()));

      if (top.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🏆 Ranking de Riqueza")
              .setDescription("Ninguém tem moedas ainda!")
              .setColor("Red"),
          ],
        });
      }

      const lista = top
        .map((user, i) => `**#${i + 1}** — <@${user.id}> • 💰 ${user.coins}`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🏆 Ranking de Riqueza")
        .setDescription(lista)
        .setColor("Gold")
        .setFooter({ text: "Top 10 usuários mais ricos" });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar o comando 'top':", error);
      message.reply("❌ Ocorreu um erro ao buscar o ranking de moedas.");
    }
  },
};