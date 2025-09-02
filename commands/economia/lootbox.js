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
      const inv = await getInventory(message.author.id);
      const lootboxes = inv.filter(i => i.toLowerCase().startsWith("lootbox"));
      if (lootboxes.length === 0) {
        return message.reply("📦 Você não tem nenhuma lootbox para abrir!");
      }

      // Remove 1 lootbox (a primeira encontrada)
      const lootboxName = lootboxes[0];
      db.prepare("DELETE FROM inventory WHERE userId = ? AND item = ? LIMIT 1")
        .run(message.author.id, lootboxName);

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

      // Adiciona lootbox da raridade ao inventário como item
      const lootboxItem = `Lootbox ${raridadeEscolhida.charAt(0).toUpperCase() + raridadeEscolhida.slice(1)}`;
      db.prepare("INSERT INTO inventory (userId, item) VALUES (?, ?)")
        .run(message.author.id, lootboxItem);

      return message.channel.send(
        `🎁 ${message.author} abriu uma **${lootboxItem}**!\n` +
        `✨ Você recebeu: **${ganho.item}**!`
      );
    }

    return message.reply("❌ Subcomando inválido. Use `info` ou `abrir`.");
  }
};
