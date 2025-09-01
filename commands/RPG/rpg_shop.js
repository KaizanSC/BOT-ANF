import { EmbedBuilder } from "discord.js";
import { getRPGShop } from "../../utils/database.js";

export default {
  name: "rpg-shop",
  description: "Mostra os itens da loja RPG",
  async execute(message) {
    const shop = await getRPGShop();
    if (!shop.length) return message.reply("🏪 A loja RPG está vazia!");

    const embed = new EmbedBuilder()
      .setTitle("🏪 Loja RPG")
      .setDescription(shop.map(i => `**${i.item}** — 💰 ${i.price}`).join("\n"))
      .setColor("Gold")
      .setFooter({ text: "Use !buy <item> para comprar." });

    message.channel.send({ embeds: [embed] });
  },
};

