import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos ou de uma categoria específica",
  async execute(message, args, prefix) {
    const commands = message.client.commands;

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
      .setFooter({ text: `Use ${prefix}help [categoria]` })
      .setTimestamp();

    const helpMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = helpMessage.createMessageComponentCollector({
      componentType: "STRING_SELECT",
      time: 60000
    });

    collector.on("collect", async interaction => {
      // Apenas o autor pode interagir
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "❌ Apenas quem usou o comando pode escolher.", ephemeral: true });
      }

      // Responde imediatamente para evitar "interação falhou"
      await interaction.deferUpdate();

      const selectedCategory = interaction.values[0];
      const filteredCommands = [...commands.values()].filter(
        cmd => (cmd.category || "Sem categoria").toLowerCase() === selectedCategory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`📂 Comandos da categoria: ${selectedCategory}`)
        .setColor("#0099ff")
        .setDescription(
          filteredCommands.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`).join("\n")
        )
        .setFooter({ text: `Use ${prefix}help [categoria] para filtrar` })
        .setTimestamp();

      // Edita a mensagem com o embed da categoria
      await helpMessage.edit({ embeds: [categoryEmbed], components: [row] });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components[0].setDisabled(true)
      );
      await helpMessage.edit({ components: [disabledRow] });
    });
  }
};
