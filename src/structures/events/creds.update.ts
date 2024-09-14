import { Client } from '../client'
import { BaileysEvent } from '../../decorators'

@BaileysEvent('creds.update', 'execute')
export class CredsUpdate {
    constructor(private readonly client: Client) {}

    public async execute(): Promise<void> {
        await this.client.session.saveCreds()
    }
}
