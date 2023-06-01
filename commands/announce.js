const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Announce something to a channel')
        .addStringOption(option => option
            .setName('message')
            .setDescription('The message to announce')
            .setRequired(true),
        )
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to announce to')
            .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
            .setRequired(false),
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription('The title of the announcement')
            .setRequired(false),
        )
        .addMentionableOption(option => option
            .setName('mention')
            .setDescription('Whether to mention a role or user')
            .setRequired(false),
        )
        .addAttachmentOption(option => option
            .setName('attachment')
            .setDescription('Whether to attach a file')
            .setRequired(false),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(bot, interaction) {
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;
        const title = interaction.options.getString('title') ?? "Announcement";
        const message = interaction.options.getString('message');
        const mention = interaction.options.getMentionable('mention') ?? null;
        const attachment = interaction.options.getAttachment('attachment') ?? null;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor(0xffbb00)
            .setTimestamp()
            .setFooter({
                text: `Annoucement made by ${interaction.user.username}`, iconURL: interaction.user.avatarURL({ size: 2048, dynamic: true })
            });

        if (attachment) {
            embed.setImage(attachment.url);
        }
        if (mention) {
            let newMessage = message + ' ' + mention.toString();
            embed.setDescription(newMessage);
        }

        // send the embed to the channel
        await channel.send({ embeds: [embed] });
        // send a message to the channel to mention the role in mention, and delete it after it was sent
        if (mention) {
            const ms = await channel.send({ content: mention.toString(), fetchReply: true });
            await ms.delete();
        }
        await interaction.reply({ content: `Announcement ${title} sent to ${channel.toString()}`, ephemeral: true });
    }
}
