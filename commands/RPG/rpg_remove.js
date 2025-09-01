import { EmbedBuilder } from "discord.js";
import { removeRPGShopItem } from "../../utils/database.js";

export default {
  name: "rpg-removeitem",
  description: "Remove um item da loja RPG (admin)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle("❌ Acesso negado").setDescription("Você precisa ser administrador").setColor("Red")] });
    }

    const itemName = args.join(" ");
    if (!itemName) return message.reply("❌ Use: `!removeitem <nome>`");

    const success = await removeRPGShopItem(itemName);
    if (!success) return message.reply(`❌ O item **${itemName}** não existe na loja.`);
    message.reply(`✅ O item **${itemName}** foi removido da loja.`);
  },
};
