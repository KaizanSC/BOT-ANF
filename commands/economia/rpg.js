import { EmbedBuilder } from "discord.js";
import { getUser, updateCoins } from "../../utils/database.js";

export default {
  name: "aventura",
  description: "Vá em uma aventura e ganhe moedas!",
  async execute(message) {
    const user = await getUser(message.author.id);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;
    const diff = now - (user.lastAdventure || 0);

    if (diff < cooldown) {
      const restante = cooldown - diff;
      const minutos = Math.floor(restante / 60000);
      return message.reply(`⏳ Você já se aventurou! Tente novamente em ${minutos} minutos.`);
    }

    const eventos = [
      { texto: "Você derrotou um goblin e ganhou 50 ANF Coins!", moedas: 50 },
      { texto: "Você encontrou um tesouro e ganhou 100 ANF Coins!", moedas: 100 },
      { texto: "Você se perdeu na floresta, nada aconteceu.", moedas: 0 }
    ];

    const evento = eventos[Math.floor(Math.random() * eventos.length)];
    if (evento.moedas) await updateCoins(message.author.id, evento.moedas);

    user.lastAdventure = now;
    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🗺️ Aventura")
      .setDescription(evento.texto)
      .setColor(evento.moedas >= 0 ? "Green" : "Red");

    message.reply({ embeds: [embed] });
  }
};
