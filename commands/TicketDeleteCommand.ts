import { BaseCommand, Command } from '@discord-factory/core'
import { Message } from 'discord.js'
import Ticket from 'App/ticket/data/Ticket'

@Command({
    label: 'close',
    description: 'Afficher les commandes',
    tag: 'close',
    usages: ['close'],
})
export default class TicketDeleteCommand implements BaseCommand {
    public async run(message: Message, args: Array<string>): Promise<void> {
        const ticket = await Ticket.findOne({ where: { channel: message.channel.id } })

        if (ticket) {
            await Promise.all([
                message.channel.send('le ticket se fermera dans 5 secondes'),
                ticket.remove(),
            ])

            setTimeout(async () => {
                await message.channel.delete()
            }, 5 * 1000)
        }
    }
}