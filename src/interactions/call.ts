import { WACallEvent } from '@whiskeysockets/baileys'
import { On } from '../decorators'
import { Client } from '../structures'

@On('new-call', false, 'handle')
export class Call {
    constructor(private readonly client: Client) {}

    public async handle(call: WACallEvent): Promise<void> {
        this.client.log(
            `Call from ${call.from.split('@')[0]}`,
            'call',
            'yellowBright'
        )
        await this.client.sock.rejectCall(call.id, call.from)
        this.client.log('Call rejected!', 'call', 'yellowBright')
    }
}
