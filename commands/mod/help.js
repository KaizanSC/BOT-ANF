import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default {
  name: "help",
  description: "Mostra a lista de comandos ou de uma categoria específica",
  async execute(message, args, prefix) {
    const commands = message.client.commands;

    // Pega todas as categorias únicas
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

    // Envia a mensagem com o menu
    const helpMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Função para coletar a interação do select menu
    const filter = i => i.user.id === message.author.id; // apenas autor pode usar
    const collector = helpMessage.createMessageComponentCollector({
      filter,
      componentType: "STRING_SELECT",
      time: 60000
    });

    collector.on("collect", async interaction => {
      // Filtra os comandos da categoria selecionada
      const selectedCategory = interaction.values[0];
      const filteredCommands = [...commands.values()].filter(
        cmd => (cmd.category || "Sem categoria").toLowerCase() === selectedCategory
      );

      // Cria o embed com os comandos da categoria
      const categoryEmbed = new EmbedBuilder()
        .setTitle(`📂 Comandos da categoria: ${selectedCategory}`)
        .setColor("#0099ff")
        .setDescription(
          filteredCommands.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`).join("\n")
        )
        .setFooter({ text: `Use ${prefix}help [categoria] para filtrar` })
        .setTimestamp();

      // Responde à interação usando update, funciona porque agora é via collector
      await interaction.update({ embeds: [categoryEmbed], components: [row] });
    });

    collector.on("end", async () => {
      // Desativa o menu após expirar
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components[0].setDisabled(true)
      );
      await helpMessage.edit({ components: [disabledRow] });
    });
  }
};
