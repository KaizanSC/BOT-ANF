import { EmbedBuilder } from "discord.js";
import { addRPGShopItem } from "../../utils/database.js";

export default {
  name: "rpg-additem",
  description: "Adiciona um item à loja RPG (apenas administradores).",
  execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Acesso Negado")
            .setDescription("Você precisa ser administrador para usar este comando.")
            .setColor("Red")
        ]
      });
    }

    const [nome, preco] = args;
    const itemName = nome?.trim();
    const itemPrice = parseInt(preco);

    if (!itemName || isNaN(itemPrice)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Erro ao adicionar item")
            .setDescription("Uso correto: `!rpg-additem <nome> <preço>`")
            .setColor("Red")
        ]
      });
    }

    addRPGShopItem(itemName, itemPrice);

    const embed = new EmbedBuilder()
      .setTitle("✅ Item Adicionado")
      .setDescription(`O item **${itemName}** foi adicionado à loja por 💰 **${itemPrice} RPGCoins**.`)
      .setColor("Green");

    message.reply({ embeds: [embed] });
  }
};

