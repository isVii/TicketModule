import { BaseEvent, Event } from '@discord-factory/core'
import { MessageReaction, User } from 'discord.js'
import Ticket from 'App/ticket/data/Ticket'
import Logger from '@leadcodedev/logger'

@Event('messageReactionAdd')
export default class ReactionAddEvent implements BaseEvent {
    public async run(reaction: MessageReaction, user: User, args: Array<string>): Promise<void> {
        if (reaction.message.author?.bot) {
            if (user.bot) return
            if (reaction.emoji.name === '🎫') {
                const ticket = await Ticket.findOne({ where: { channel: reaction.message.channel.id } })

                if (ticket) {
                    await Promise.all([
                        reaction.remove(),
                        reaction.message.channel.send('le ticket se fermera dans 5 secondes'),
                    ])

                    setTimeout(async () => {
                        await reaction.message.channel.delete()
                        Logger.send('success', `Ticket deleted ! Author: ${ticket.userId}`)
                        await ticket.remove()
                    }, 5 * 1000)
                }
            }
        }
    }
}