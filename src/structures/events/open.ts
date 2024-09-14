import { Client } from '../client'
import { On } from '../../decorators'

@On('open', true)
export class Open {
    constructor(private readonly client: Client) {}

    public run(): void {
        this.client.log('The chatbot is ready to go!')
    }
}
