import { EmbedBuilder } from "discord.js";
import { getRPGShop } from "../../utils/database.js";

export default {
  name: "rpg-shop",
  description: "Mostra os itens disponíveis na loja RPG.",
  execute(message) {
    const shop = getRPGShop();

    if (shop.length === 0) {
      return message.reply("🏪 A loja RPG está vazia!");
    }

    const embed = new EmbedBuilder()
      .setTitle("🏪 Loja RPG")
      .setDescription(
        shop.map(item => `**${item.item}** — 💰 ${item.price} RPGCoins`).join("\n")
      )
      .setColor("Gold")
      .setFooter({ text: "Use !rpg-buy <item> para comprar." });

    message.channel.send({ embeds: [embed] });
  }
};
