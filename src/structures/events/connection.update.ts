import {
    BaileysEventMap,
    DisconnectReason,
    delay
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { Client } from '../client'
import { BaileysEvent } from '../../decorators'

@BaileysEvent('connection.update', 'execute')
export class ConnectionUpdate {
    constructor(private readonly client: Client) {}

    public async execute(
        update: BaileysEventMap['connection.update']
    ): Promise<void> {
        const { connection, lastDisconnect } = update
        if (update.qr)
            this.client.log(
                'Scan the QR code from the terminal to connect your WhatsApp device.',
                'QR',
                'blueBright'
            )
        if (connection === 'connecting')
            this.client.log(
                'Connecting to WhatsApp...',
                'connection',
                'greenBright'
            )
        if (connection === 'open') {
            this.client.log(
                'Connected to the WhatsApp.',
                'connection',
                'greenBright'
            )
            this.client.emit('open')
        }
        if (connection === 'close') {
            if (
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut
            )
                await this.client.start()
            else {
                console.log(
                    "You've been logged out of this session.",
                    'connection',
                    'greenBright'
                )
                await delay(3000)
                await this.client.deleteSession()
                await this.client.start()
            }
        }
    }
}
