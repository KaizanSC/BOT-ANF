import { EmbedBuilder } from "discord.js";
import { User, Inventory } from "../../utils/database.js";

export default {
  name: "raspadinha",
  description: "Teste sua sorte na raspadinha!",
  async execute(message) {
    try {
      const user = await User.findByPk(message.author.id);

      if (!user) {
        return message.reply("❌ Você ainda não está registrado no sistema.");
      }

      const now = Date.now();
      const diff = now - (user.lastScratch || 0);

      if (diff < 43200000) { // 12h cooldown
        const horas = Math.floor((43200000 - diff) / 3600000);
        return message.reply(`⏳ Você já usou a raspadinha! Tente novamente em ${horas}h.`);
      }

      const premios = [
        { texto: "Nada... que azar! 😭", valor: 0 },
        { texto: "Ganhou 10 ANF Coins!", valor: 10 },
        { texto: "Ganhou 50 ANF Coins!", valor: 50 },
        { texto: "Ganhou 100 ANF Coins!", valor: 100 },
        { texto: "🎁 Você ganhou uma Lootbox!", valor: 0, lootbox: true }
      ];

      const premio = premios[Math.floor(Math.random() * premios.length)];

      // adiciona moedas
      if (premio.valor > 0) {
        user.coins += premio.valor;
      }

      // adiciona lootbox no inventário
      if (premio.lootbox) {
        await Inventory.create({
          userId: message.author.id,
          item: "Lootbox"
        });
      }

      // salva cooldown
      user.lastScratch = now;
      await user.save();

      const embed = new EmbedBuilder()
        .setTitle("🎰 Raspadinha!")
        .setDescription(premio.texto)
        .setColor(premio.valor > 0 || premio.lootbox ? "Green" : "Red")
        .setFooter({ text: "Você poderá jogar novamente em 12h!" });

      message.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Erro no comando raspadinha:", err);
      message.reply("❌ Ocorreu um erro ao jogar a raspadinha.");
    }
  }
};
