import {Application, BaseSlashCommand, SlashCommand } from '@discord-factory/core'
import {CategoryChannel, CommandInteraction, MessageEmbed } from 'discord.js'
import Logger from '@leadcodedev/logger'
import Ticket from 'App/ticket/data/Ticket'

@SlashCommand({
    scope: ['819691605425520731'],
    options: {
        name: 'ticket',
        description: 'TicketSlashCommand description',
        options: [
            {
                name: 'actions',
                type: 'STRING',
                description: 'choose an action',
                choices: [
                    { name: 'create', value: 'create' },
                    { name: 'delete', value: 'delete' },
                ],
            },
        ],
    },
})
export default class TicketSlashCommand implements BaseSlashCommand {
    public async run(interaction: CommandInteraction): Promise<void> {
        let haveTicket

        switch (interaction.options.getString('actions', true)) {
            case 'create':
                haveTicket = await Ticket.findOne({ where: { userId: interaction.user.id } })

                if (haveTicket) {
                    await interaction.reply('Vous avez déjà un ticket')
                }
                else {
                    const category = interaction.guild?.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY' && channel.id === '871893316734709841').first() as CategoryChannel

                    if (category?.children.size >= 50) { // for the discord limit
                        await interaction.reply('Il y a actuellement trop de channel merci de patienter.')
                        return
                    }

                    const ticket = await interaction.guild?.channels.create(`ticket-${interaction.user.username}`, {
                        type: 'GUILD_TEXT',
                        parent: '871893316734709841',
                        permissionOverwrites: [{
                            id: '835517109487271997',
                            allow: ['VIEW_CHANNEL'],
                        }, {
                            id: interaction.guild?.roles.everyone.id,
                            deny: ['VIEW_CHANNEL'],
                        }],
                    })

                    await interaction.reply(`Ticket créé ${ticket}`)

                    const embed = await ticket?.send({
                        embeds: [new MessageEmbed()
                            .setTitle(`Ticket de ${interaction.user.username}`)
                            .setThumbnail(interaction.user.displayAvatarURL())
                            .setDescription('Décrivez votre problème au maximum ! Un staff s\'occupera de vous dans les plus brefs délais')
                            .setColor('BLUE')
                            .setTimestamp()
                            .setFooter('ipduserveur', Application.getClient()?.user?.displayAvatarURL())],
                    })

                    await Promise.all([
                        Ticket.create({
                            userId: interaction.user.id,
                            channel: ticket?.id,
                        }).save(),
                        embed?.react('🎫'),
                    ])

                    Logger.send('success', `Ticket created ! Author: ${interaction.user.username}`)
                }
                break
            case 'delete':
                haveTicket = await Ticket.findOne({ where: { channel: interaction.channel?.id } })

                if (haveTicket) {
                    await interaction.reply('le ticket se fermera dans 5 secondes')

                    setTimeout(async () => {
                        await interaction.channel?.delete()
                        Logger.send('success', `Ticket deleted ! Author: ${haveTicket.userId}`)
                        await haveTicket.remove()
                    }, 5 * 1000)
                }
                else {
                    await interaction.reply('Ce salon n\'est pas un ticket')
                }
                break
        }
    }
}