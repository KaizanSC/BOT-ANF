import { EmbedBuilder } from "discord.js";
import { ShopItem } from "../../utils/database.js"; // caminho para o database.js

export default {
  name: "removeitem",
  description: "Remove um item da loja (apenas administradores).",
  async execute(message, args) {
    // Verificação de permissão de administrador
    if (!message.member.permissions.has("Administrator")) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Acesso Negado")
            .setDescription("Você precisa ser administrador para usar este comando.")
            .setColor("Red"),
        ],
      });
    }

    if (!args.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Comando inválido")
            .setDescription("Digite o nome do item que deseja remover.")
            .setColor("Red"),
        ],
      });
    }

    const itemName = args.join(" ");

    try {
      const item = await ShopItem.findByPk(itemName);
      if (!item) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Item não encontrado")
              .setDescription(`O item **${itemName}** não existe na loja.`)
              .setColor("Red"),
          ],
        });
      }

      await item.destroy();

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Item removido")
            .setDescription(`O item **${itemName}** foi removido da loja.`)
            .setColor("Green"),
        ],
      });

      console.log(`Item removido da loja: ${itemName}`);
    } catch (error) {
      console.error("Erro ao remover item:", error);
      message.reply("❌ Ocorreu um erro ao remover o item.");
    }
  },
};