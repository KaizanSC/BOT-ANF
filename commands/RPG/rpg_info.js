import { EmbedBuilder } from "discord.js";

const rpgLootTable = {
  comum: [
    { item: "🪓 Machado Velho", chance: 30, tipo: "item" },
    { item: "⚒️ Minério de Ferro", chance: 40, tipo: "item" },
    { item: "🪙 5 RPGCoins", chance: 30, tipo: "coins", valor: 5 }
  ],
  incomum: [
    { item: "⚔️ Espada de Bronze", chance: 40, tipo: "item" },
    { item: "🛡️ Escudo de Madeira", chance: 30, tipo: "item" },
    { item: "🪙 10 RPGCoins", chance: 30, tipo: "coins", valor: 10 }
  ],
  rara: [
    { item: "🏹 Arco Longo", chance: 35, tipo: "item" },
    { item: "⛏️ Minério de Prata", chance: 35, tipo: "item" },
    { item: "🪙 20 RPGCoins", chance: 30, tipo: "coins", valor: 20 }
  ],
  epica: [
    { item: "🔥 Espada Flamejante", chance: 40, tipo: "item" },
    { item: "💎 Minério de Ouro", chance: 30, tipo: "item" },
    { item: "🪙 50 RPGCoins", chance: 30, tipo: "coins", valor: 50 }
  ],
  lendaria: [
    { item: "👑 Armadura Dourada", chance: 40, tipo: "item" },
    { item: "⚡ Espada do Trovão", chance: 40, tipo: "item" },
    { item: "🪙 100 RPGCoins", chance: 20, tipo: "coins", valor: 100 }
  ],
  suprema: [
    { item: "🔮 Cajado Arcano", chance: 45, tipo: "item" },
    { item: "🧪 Elixir Supremo", chance: 45, tipo: "item" },
    { item: "🪙 200 RPGCoins", chance: 10, tipo: "coins", valor: 200 }
  ],
  goodly: [
    { item: "🗡️ Relíquia dos Deuses", chance: 45, tipo: "item" },
    { item: "🏆 Coroa Divina", chance: 50, tipo: "item" },
    { item: "🪙 500 RPGCoins", chance: 5, tipo: "coins", valor: 500 }
  ]
};

// Cores para raridade
const raridadeColors = {
  comum: "Grey",
  incomum: "Green",
  rara: "Blue",
  epica: "Purple",
  lendaria: "Gold",
  suprema: "Orange",
  goodly: "Red"
};

export default {
  name: "rpg-lootbox-info",
  description: "Mostra os itens possíveis de uma lootbox RPG por raridade",
  execute(message, args) {
    if (!args.length || args[0].toLowerCase() !== "info") {
      return message.reply("❌ Use: `!rpg lootbox info {raridade}`\nEx: `!rpg lootbox info rara`");
    }

    const raridade = args[1]?.toLowerCase();
    if (!raridade || !rpgLootTable[raridade]) {
      return message.reply("❌ Raridade inválida! Exemplos: comum, incomum, rara, epica, lendaria, suprema, goodly");
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎁 Lootbox RPG — Raridade ${raridade.toUpperCase()}`)
      .setColor(raridadeColors[raridade] || "White")
      .setDescription(
        rpgLootTable[raridade]
          .map(i => `- **${i.item}** (${i.chance}%)`)
          .join("\n")
      )
      .setFooter({ text: "Use suas lootboxes com sabedoria!" });

    message.channel.send({ embeds: [embed] });
  }
};
