const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option => option
            .setName('content')
            .setDescription('Content of the poll, in the format json, example:')
            .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(bot, interaction) {
        const content = interaction.options.getString('content');

        const pollValues = JSON.parse(content);

        const title = pollValues.title;
        const rows = pollValues.rows;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor('#0099ff')
            .setTimestamp()
            .addFields(
                rows.map(row => {
                    return {
                        name: row.question,
                        value: row.choices.map(choice => {
                            return `${choice.emoji} ${choice.text}`;
                        }).join('\n'),
                    };
                }
                ),
            );

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const value = row.choices;
            for (let j = 0; j < value.length; j++) {
                const choice = value[j];
                await message.react(choice.emoji);
            }
        }

        const filter = (reaction, user) => {
            return rows.some(row => {
                return row.choices.some(choice => {
                    return choice.emoji === reaction.emoji.name;
                });
            });
        }

        const collector = message.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            const row = rows.find(row => {
                return row.choices.some(choice => {
                    return choice.emoji === reaction.emoji.name;
                });
            });

            if (!row) {
                return;
            }

            const choice = row.choices.find(choice => {
                return choice.emoji === reaction.emoji.name;
            });
            if (!choice) {
                return;
            }

            const member = interaction.guild.members.cache.get(user.id);
            const role = interaction.guild.roles.cache.find(role => {
                return role.name === choice.role;
            });
            if (!role) {
                interaction.channel.send(`Role ${choice.role} not found`);
                return;
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role);
                interaction.channel.send(`Removed role ${role.name} from ${member.user.username}`);
            } else {
                member.roles.add(role);
                interaction.channel.send(`Added role ${role.name} to ${member.user.username}`);
            }
        });
    }
}
