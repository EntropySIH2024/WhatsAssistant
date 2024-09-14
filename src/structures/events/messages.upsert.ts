import { BaileysEventMap } from '@whiskeysockets/baileys'
import { Client } from '../client'
import { BaileysEvent } from '../../decorators'

@BaileysEvent('messages.upsert', 'handle')
export class MessagesUpsert {
    constructor(private readonly client: Client) {}

    public handle(msg: BaileysEventMap['messages.upsert']): void {
        if (
            ['senderKeyDistributionMessage', 'protocolMessage'].includes(
                msg.type
            )
        )
            return void null
        this.client.emit('new-message', msg.messages[0])
    }
}
