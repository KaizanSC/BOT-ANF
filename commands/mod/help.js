import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos ou de uma categoria específica",
  async execute(message, args, prefix) {
    const commands = message.client.commands;

    // Pega todas as categorias únicas dos comandos
    const categories = [...new Set([...commands.values()].map(cmd => cmd.category || "Sem categoria"))];

    // Cria o select menu
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

    // Embed inicial
    const embed = new EmbedBuilder()
      .setTitle("📜 Menu de Ajuda")
      .setColor("#0099ff")
      .setDescription("Selecione uma categoria no menu abaixo para ver os comandos.")
      .setFooter({ text: `Use ${prefix}help [categoria]` })
      .setTimestamp();

    const helpMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Criar um collector para escutar a interação
    const collector = helpMessage.createMessageComponentCollector({
      componentType: "STRING_SELECT",
      time: 60000 // 1 minuto para escolher
    });

    collector.on("collect", async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "❌ Apenas quem usou o comando pode escolher.", ephemeral: true });
      }

      const selectedCategory = interaction.values[0];
      const filteredCommands = [...commands.values()].filter(
        cmd => (cmd.category || "Sem categoria").toLowerCase() === selectedCategory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`📂 Comandos da categoria: ${selectedCategory}`)
        .setColor("#ae00ff")
        .setDescription(
          filteredCommands.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`).join("\n")
        )
        .setFooter({ text: `Use ${prefix}help [categoria] para filtrar` })
        .setTimestamp();

      await interaction.update({ embeds: [categoryEmbed], components: [row] });
    });

    collector.on("end", () => {
      // Quando o tempo acabar, desativa o menu
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components[0].setDisabled(true)
      );
      helpMessage.edit({ components: [disabledRow] });
    });
  }
};