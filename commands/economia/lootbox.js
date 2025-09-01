import { EmbedBuilder } from "discord.js";
import { getInventory } from "../../utils/database.js";

// Lootbox Tabelas
const lootTable = {
  comum: [
    { item: "💰 50 ANFCoins", chance: 60, tipo: "coins", valor: 50 },
    { item: "💰 100 ANFCoins", chance: 30, tipo: "coins", valor: 100 },
    { item: "💰 200 ANFCoins", chance: 10, tipo: "coins", valor: 200 }
  ],
  incomum: [
    { item: "💰 250 ANFCoins", chance: 50, tipo: "coins", valor: 250 },
    { item: "💰 300 ANFCoins", chance: 30, tipo: "coins", valor: 300 },
    { item: "💰 400 ANFCoins", chance: 20, tipo: "coins", valor: 400 }
  ],
  rara: [
    { item: "💰 500 ANFCoins", chance: 70, tipo: "coins", valor: 500 },
    { item: "💰 1000 ANFCoins", chance: 30, tipo: "coins", valor: 1000 }
  ],
  epica: [
    { item: "💰 1500 ANFCoins", chance: 50, tipo: "coins", valor: 1500 },
    { item: "💰 2000 ANFCoins", chance: 50, tipo: "coins", valor: 2000 }
  ],
  lendaria: [
    { item: "💰 3000 ANFCoins", chance: 50, tipo: "coins", valor: 3000 },
    { item: "💰 4000 ANFCoins", chance: 50, tipo: "coins", valor: 4000 }
  ],
  suprema: [
    { item: "💰 5000 ANFCoins", chance: 60, tipo: "coins", valor: 5000 },
    { item: "💰 7000 ANFCoins", chance: 40, tipo: "coins", valor: 7000 }
  ],
  goodly: [
    { item: "💰 10000 ANFCoins", chance: 100, tipo: "coins", valor: 10000 }
  ]
};

// Cores por raridade
const raridadeColors = {
  comum: "Grey",
  incomum: "Green",
  rara: "Blue",
  epica: "Purple",
  lendaria: "Gold",
  suprema: "Orange",
  goodly: "Red"
};

// Probabilidade de raridade
const raridadeChance = [
  { raridade: "comum", chance: 50 },
  { raridade: "incomum", chance: 25 },
  { raridade: "rara", chance: 12 },
  { raridade: "epica", chance: 7 },
  { raridade: "lendaria", chance: 4.5 },
  { raridade: "suprema", chance: 1.3 },
  { raridade: "goodly", chance: 0.2 }
];

export default {
  name: "lootbox",
  description: "Comando de lootbox (info ou abrir)",
  async execute(message, args) {
    const db = (await import("../../utils/database.js")).default;

    if (!args.length) {
      return message.reply("❌ Use: `!lootbox info {raridade}` ou `!lootbox abrir`");
    }

    const sub = args[0].toLowerCase();

    // INFO
    if (sub === "info") {
      const raridade = args[1]?.toLowerCase();
      if (!raridade || !lootTable[raridade]) {
        return message.reply(
          "❌ Use: `!lootbox info {raridade}`\nEx: `!lootbox info rara`\nRaridades: `comum, incomum, rara, epica, lendaria, suprema, goodly`"
        );
      }

      const lista = lootTable[raridade]
        .map(i => `- **${i.item}** (${i.chance}%)`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`🎁 Lootbox — Raridade ${raridade.toUpperCase()}`)
        .setDescription(`Itens possíveis:\n${lista}`)
        .setColor(raridadeColors[raridade] || "Gold")
        .setFooter({ text: "Abra lootboxes com !lootbox abrir" });

      return message.channel.send({ embeds: [embed] });
    }

    // ABRIR
    if (sub === "abrir") {
      const inv = getInventory(message.author.id);
      const lootboxes = inv.filter(i => i.item === "Lootbox");
      if (lootboxes.length === 0) {
        return message.reply("📦 Você não tem nenhuma lootbox para abrir!");
      }

      // Remove 1 lootbox
      db.prepare("DELETE FROM inventory WHERE userId = ? AND item = ? LIMIT 1")
        .run(message.author.id, "Lootbox");

      // Sorteio raridade
      let totalR = raridadeChance.reduce((s, r) => s + r.chance, 0);
      let rollR = Math.random() * totalR;
      let raridadeEscolhida;
      for (const r of raridadeChance) {
        if (rollR < r.chance) {
          raridadeEscolhida = r.raridade;
          break;
        }
        rollR -= r.chance;
      }

      // Sorteio item
      const tabela = lootTable[raridadeEscolhida];
      let totalI = tabela.reduce((s, i) => s + i.chance, 0);
      let rollI = Math.random() * totalI;
      let ganho;
      for (const i of tabela) {
        if (rollI < i.chance) {
          ganho = i;
          break;
        }
        rollI -= i.chance;
      }

      // Dar recompensa
      if (ganho.tipo === "coins") {
        db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?")
          .run(ganho.valor, message.author.id);
      } else {
        db.prepare("INSERT INTO inventory (userId, item) VALUES (?, ?)")
          .run(message.author.id, ganho.item);
      }

      return message.channel.send(
        `🎁 ${message.author} abriu uma **Lootbox**!\n` +
        `✨ Você recebeu um item **${raridadeEscolhida.toUpperCase()}**: **${ganho.item}**!`
      );
    }

    return message.reply("❌ Subcomando inválido. Use `info` ou `abrir`.");
  }
};
