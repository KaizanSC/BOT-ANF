import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mostra a lista de comandos ou de uma categoria específica"),

  async execute(interaction, client) {
    const commands = client.commands;

    const categories = [...new Set([...commands.values()].map(cmd => cmd.category || "Sem categoria"))];

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help_menu")
        .setPlaceholder("Selecione uma categoria")
        .addOptions(
          categories.map(cat => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            value: cat.toLowerCase(),
            description: `Veja os comandos da categoria ${cat}`
          }))
        )
    );

    const embed = new EmbedBuilder()
      .setTitle("📜 Menu de Ajuda")
      .setColor("#0099ff")
      .setDescription("Selecione uma categoria no menu abaixo para ver os comandos.")
      .setFooter({ text: `Use /help` })
      .setTimestamp();

    // Envia a mensagem como reply da interação
    await interaction.reply({ embeds: [embed], components: [row] });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: "STRING_SELECT",
      time: 60000
    });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Apenas quem usou o comando pode escolher.", ephemeral: true });
      }

      const selectedCategory = i.values[0];
      const filteredCommands = [...commands.values()].filter(
        cmd => (cmd.category || "Sem categoria").toLowerCase() === selectedCategory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`📂 Comandos da categoria: ${selectedCategory}`)
        .setColor("#0099ff")
        .setDescription(
          filteredCommands.map(cmd => `**/${cmd.name}** - ${cmd.description}`).join("\n")
        )
        .setFooter({ text: `Use /help` })
        .setTimestamp();

      await i.update({ embeds: [categoryEmbed], components: [row] });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components[0].setDisabled(true)
      );
      await message.edit({ components: [disabledRow] });
    });
  }
};
