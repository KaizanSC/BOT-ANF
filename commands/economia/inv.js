import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../utils/database.js";

export default {
  name: "inv",
  description: "Mostra seu inventário",
  async execute(message) {
    const items = await getInventory(message.author.id);

    if (!items.length) return message.reply("📦 Seu inventário está vazio!");

    const lootboxes = items.filter(i => i.startsWith("lootbox"));
    const outros = items.filter(i => !i.startsWith("lootbox"));

    const embed = new EmbedBuilder()
      .setTitle(`${message.author.username} — Inventário`)
      .setColor("Blue")
      .addFields(
        { name: "📦 Lootboxes", value: lootboxes.length ? lootboxes.join("\n") : "Nenhuma", inline: true },
        { name: "🎒 Outros itens", value: outros.length ? outros.join("\n") : "Nenhum", inline: true }
      );

    message.channel.send({ embeds: [embed] });
  }
};
