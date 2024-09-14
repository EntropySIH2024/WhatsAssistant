import { WACallEvent } from '@whiskeysockets/baileys'
import { Client } from '../client'
import { BaileysEvent } from '../../decorators'

@BaileysEvent('call')
export class BaileysCall {
    constructor(private readonly client: Client) {}

    public run([call]: WACallEvent[]): void {
        this.client.emit('new-call', call)
    }
}
