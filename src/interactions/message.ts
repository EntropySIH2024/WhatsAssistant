import { proto } from '@whiskeysockets/baileys'
import { Client } from '../structures'
import { On } from '../decorators'

@On('new-message')
export class Message {
    constructor(private readonly client: Client) {}

    public run(msg: proto.IWebMessageInfo): void {
        this.client.log('Message!', 'message', 'cyanBright')
    }
}
