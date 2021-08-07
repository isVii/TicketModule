import { BaseEvent, Event } from '@discord-factory/core'
import { MessageReaction, User } from 'discord.js'
import Ticket from 'App/ticket/data/Ticket'

@Event('messageReactionAdd')
export default class ReactionAddEvent implements BaseEvent {
    public async run(reaction: MessageReaction, user: User, args: Array<string>): Promise<void> {
        if (reaction.message.author.bot) {
            if (user.bot) return
            if (reaction.emoji.name === '🎫') {
                const ticket = await Ticket.findOne({ where: { channel: reaction.message.channel.id } })

                if (ticket) {
                    await Promise.all([
                        reaction.message.channel.send('le ticket se fermera dans 5 secondes'),
                        reaction.remove(),
                        ticket.remove(),
                    ])

                    setTimeout(async () => {
                        await reaction.message.channel.delete()
                    }, 5 * 1000)
                }
            }
        }
    }
}