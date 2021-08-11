import { BaseEvent, Event } from '@discord-factory/core'
import { GuildChannel } from 'discord.js'
import { PARENT_ID } from 'App/ticket/Settings'
import Ticket from 'App/ticket/data/Ticket'
import Logger from '@leadcodedev/logger'

@Event('channelDelete')
export default class TicketDeleteEvent implements BaseEvent {
    public async run(channel: GuildChannel): Promise<void> {
        if (channel.parentId === PARENT_ID) {
            const ticket = await Ticket.findOne({ where: { channel: channel.id } })
            
            if (ticket) {
                await ticket.remove()

                const user = channel.guild.members.cache.get(ticket.userId)?.user.tag || ticket.userId
                Logger.send('success', `Ticket deleted ! Author: ${user}`)
            }
        }
    }
}