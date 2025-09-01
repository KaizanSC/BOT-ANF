import { EmbedBuilder } from "discord.js";
import { User, Inventory } from "../../utils/database.js";

export default {
  name: "aventura",
  description: "Vá em uma aventura RPG e veja o que acontece!",
  async execute(message) {
    try {
      const user = await User.findByPk(message.author.id);

      if (!user) {
        return message.reply("❌ Você ainda não está registrado no sistema.");
      }

      const now = Date.now();
      const diff = now - (user.lastAdventure || 0);

      if (diff < 3600000) { // 1h cooldown
        const minutos = Math.floor((3600000 - diff) / 60000);
        return message.reply(`⏳ Você já foi em uma aventura! Tente novamente em ${minutos}min.`);
      }

      const eventos = [
        { texto: "⚔️ Você derrotou um goblin e ganhou 50 ANF Coins!", moedas: 50 },
        { texto: "👑 Você encontrou um tesouro e ganhou 100 ANF Coins!", moedas: 100 },
        { texto: "🐉 Você enfrentou um dragão mas perdeu... -30 ANF Coins.", moedas: -30 },
        { texto: "🌲 Você se perdeu na floresta, nada aconteceu.", moedas: 0 },
        { texto: "🎁 Você encontrou uma Lootbox misteriosa!", moedas: 0, lootbox: true }
      ];

      const evento = eventos[Math.floor(Math.random() * eventos.length)];

      // altera saldo
      if (evento.moedas !== 0) {
        user.coins += evento.moedas;
      }

      // adiciona lootbox
      if (evento.lootbox) {
        await Inventory.create({
          userId: message.author.id,
          item: "Lootbox"
        });
      }

      // salva cooldown
      user.lastAdventure = now;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("🗺️ Aventura RPG")
        .setDescription(`${message.author} foi em uma aventura...\n\n${evento.texto}`)
        .setColor(evento.moedas >= 0 || evento.lootbox ? "Green" : "Red")
        .setFooter({ text: "Você poderá se aventurar novamente em 1 hora!" });

      message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Erro no comando aventura:", err);
      message.reply("❌ Ocorreu um erro durante sua aventura.");
    }
  }
};