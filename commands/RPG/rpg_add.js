import { EmbedBuilder } from "discord.js";
import { addRPGShopItem } from "../../utils/database.js";

export default {
  name: "rpg-additem",
  description: "Adiciona um item à loja RPG (admin)",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({ embeds: [new EmbedBuilder().setTitle("❌ Acesso negado").setDescription("Você precisa ser administrador").setColor("Red")] });
    }

    const [nome, preco] = args;
    if (!nome || !preco || isNaN(preco)) return message.reply("❌ Uso: `!additem <nome> <preço>`");

    await addRPGShopItem(nome, parseInt(preco));
    message.reply(`✅ Item **${nome}** adicionado à loja por 💰 ${preco} RPGCoins`);
  },
};
