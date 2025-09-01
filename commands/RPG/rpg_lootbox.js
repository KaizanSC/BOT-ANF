import { EmbedBuilder } from "discord.js";
import db, { getRPGUser } from "../../utils/database.js";

const rpgLootTable = {
  comum: [
    { item: "🪓 Machado Velho", chance: 30, tipo: "item" },
    { item: "⚒️ Minério de Ferro", chance: 40, tipo: "item" },
    { item: "🪙 5 RPGCoins", chance: 30, tipo: "coins", valor: 5 }
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
  ]
};

const raridadeChance = [
  { raridade: "comum", chance: 70 },
  { raridade: "rara", chance: 25 },
  { raridade: "epica", chance: 5 }
];

export default {
  name: "rpg-lootbox",
  description: "Abra lootboxes do RPG",
  async execute(message, args) {
    if (args[0] !== "abrir") {
      return message.reply("❌ Use: `!rpg-lootbox abrir`");
    }

    await getRPGUser(message.author.id);

    const caixas = db.prepare("SELECT rowid, * FROM rpg_inventory WHERE userId = ? AND item = ?")
      .all(message.author.id, "Lootbox");

    if (caixas.length === 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📦 Lootbox não encontrada")
            .setDescription("Você não tem nenhuma lootbox de RPG!")
            .setColor("Red")
        ]
      });
    }

    // Remover 1 lootbox
    db.prepare("DELETE FROM rpg_inventory WHERE rowid = ?").run(caixas[0].rowid);

    // Sorteio de raridade
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

    // Sorteio de item
    const tabela = rpgLootTable[raridadeEscolhida];
    let totalI = tabela.reduce((s, i) => s + i.chance, 0);
    let rollI = Math.random() * totalI;
    let ganho;
    for (const item of tabela) {
      if (rollI < item.chance) {
        ganho = item;
        break;
      }
      rollI -= item.chance;
    }

    // Dar recompensa
    if (ganho.tipo === "coins") {
      db.prepare("UPDATE rpg_users SET coins = coins + ? WHERE id = ?")
        .run(ganho.valor, message.author.id);
    } else {
      db.prepare("INSERT INTO rpg_inventory (userId, item) VALUES (?, ?)")
        .run(message.author.id, ganho.item);
    }

    const embed = new EmbedBuilder()
      .setTitle("🎁 Lootbox RPG aberta!")
      .setDescription(`${message.author} abriu uma lootbox e recebeu um item **${raridadeEscolhida.toUpperCase()}**: **${ganho.item}**!`)
      .setColor("Gold");

    message.channel.send({ embeds: [embed] });
  }
};
