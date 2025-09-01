import { EmbedBuilder } from "discord.js";
import db from "../../utils/database.js";

export default {
  name: "rpg-removeitem",
  description: "Remove um item da loja RPG (apenas administradores).",
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

    if (!args.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Comando inválido")
            .setDescription("Digite o nome do item que deseja remover.")
            .setColor("Red")
        ]
      });
    }

    const itemName = args.join(" ");

    const item = db.prepare("SELECT * FROM rpg_shop WHERE item = ?").get(itemName);
    if (!item) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Item não encontrado")
            .setDescription(`O item **${itemName}** não existe na loja.`)
            .setColor("Red")
        ]
      });
    }

    db.prepare("DELETE FROM rpg_shop WHERE item = ?").run(itemName);

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Item removido")
          .setDescription(`O item **${itemName}** foi removido da loja.`)
          .setColor("Green")
      ]
    });
  }
};
