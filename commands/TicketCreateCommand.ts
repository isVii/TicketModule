import { Application, BaseCommand, Command } from '@discord-factory/core'
import { Message, MessageEmbed } from 'discord.js'
import Ticket from 'App/ticket/data/Ticket'

@Command({
    label: 'ticket',
    description: 'Afficher les commandes',
    tag: 'ticket',
    usages: ['ticket'],
})
export default class TicketCreateCommand implements BaseCommand {
    public async run(message: Message, args: Array<string>): Promise<void> {
        if (args[0] === 'close') {

        }
        const hasTicket = await Ticket.findOne({ where: { userId: message.author.id } })

        if (hasTicket) {
            await message.channel.send('Vous avez déjà un ticket')
        }
        else {
            const ticket = await message.guild?.channels.create(`ticket-${message.author.username}`, {
                type: 'text',
                parent: '871893316734709841',
                permissionOverwrites: [{
                    id: '835517109487271997',
                    allow: ['VIEW_CHANNEL'],
                }, {
                    id: message.guild?.roles.everyone.id,
                    deny: ['VIEW_CHANNEL'],
                }],
            })

            const embed = await ticket?.send(new MessageEmbed()
                .setTitle(`Ticket de ${message.author.username}`)
                .setDescription('Décrivez votre problème au maximum ! Un staff s\'occupera de vous dans les plus brefs délais')
                .setTimestamp()
                .setThumbnail(message.author.displayAvatarURL())
                .setColor('BLUE')
                .setFooter('ipduserveur', Application.getClient()?.user?.displayAvatarURL()))

            await Promise.all([
                Ticket.create({
                    userId: message.author.id, channel: ticket?.id,
                }).save(),
                embed?.react('🎫'),
            ])
        }
    }
}