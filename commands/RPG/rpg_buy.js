import { EmbedBuilder } from "discord.js";
import { buyItem, getUser } from "../../utils/database.js";

export default {
  name: "buy",
  description: "Compre um item na loja do bot",
  async execute(message, args) {
    if (!args.length) return message.reply("❌ Você precisa informar o nome do item! Ex: `!buy Espada`");

    const itemName = args.join(" ");
    const result = await buyItem(message.author.id, itemName);

    if (!result.success) {
      // Mensagem de erro mais clara
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Compra Falhou")
        .setDescription(result.message)
        .setColor("Red");
      return message.reply({ embeds: [errorEmbed] });
    }

    // Buscar usuário atualizado
    const user = await getUser(message.author.id);

    // Embed bonito da compra
    const embed = new EmbedBuilder()
      .setTitle("🛒 Compra realizada!")
      .setDescription(`Você comprou **${itemName}** por **${user.coins < 0 ? 0 : user.coins} moedas**!`)
      .addFields(
        { name: "💰 Saldo Atual", value: `${user.coins} moedas`, inline: true },
        { name: "🛍️ Item Comprado", value: itemName, inline: true }
      )
      .setColor("Gold")
      .setFooter({ text: "Obrigado por comprar na nossa loja!" });

    message.reply({ embeds: [embed] });
  },
};


