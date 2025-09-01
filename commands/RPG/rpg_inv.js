import { EmbedBuilder } from "discord.js";
import { getRPGUser } from "../../utils/database.js";

export default {
  name: "rpg-inv",
  description: "Inventário RPG",
  async execute(message) {
    await getRPGUser(message.author.id); // garante que o usuário existe

    const inv = db.prepare("SELECT item FROM rpg_inventory WHERE userId = ?").all(message.author.id);

    if (!inv.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📦 Inventário RPG")
            .setDescription("Seu inventário de RPG está vazio!")
            .setColor("Red"),
        ],
      });
    }

    const lista = inv.map(i => `- ${i.item}`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📦 Inventário RPG de ${message.author.username}`)
      .setDescription(lista)
      .setColor("Green");

    message.reply({ embeds: [embed] });
  }
};