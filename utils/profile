// ...existing code...
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'perfil',
    description: 'Mostra informações do seu perfil',
    execute: async (message, args) => {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Perfil de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Entrou no servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
                { name: 'Conta criada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true }
            )
            .setColor(0x00AE86);

        await message.reply({ embeds: [embed] });
    }
};
// ...existing code...
