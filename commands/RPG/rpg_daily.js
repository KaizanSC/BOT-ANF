import { EmbedBuilder } from "discord.js";
import { getRPGUser, updateRPGCoins } from "../../utils/database.js";

export default {
  name: "rpg-daily",
  description: "Daily do RPG",
  async execute(message) {
    const user = await getRPGUser(message.author.id);
    const now = Date.now();

    if (user.lastDaily && now - user.lastDaily < 86400000) {
      const horas = Math.floor((86400000 - (now - user.lastDaily)) / 3600000);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⏳ Daily indisponível")
            .setDescription(`Você já pegou seu daily de RPG hoje! Tente novamente em ${horas}h.`)
            .setColor("Red"),
        ],
      });
    }

    const reward = 10; // moedas RPG
    await updateRPGCoins(message.author.id, reward);

    const db = (await import("../../utils/database.js")).default;
    db.prepare("UPDATE rpg_users SET lastDaily = ? WHERE id = ?").run(now, message.author.id);

    const embed = new EmbedBuilder()
      .setTitle("🎁 Daily coletado!")
      .setDescription(`Você coletou seu daily e ganhou **${reward} RPGCoins**!`)
      .setColor("Green");

    message.reply({ embeds: [embed] });
  }
};