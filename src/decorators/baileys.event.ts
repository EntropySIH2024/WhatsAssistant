import { BaileysEventMap } from '@whiskeysockets/baileys'
import { Client } from '../structures'

export function BaileysEvent(
    event: keyof BaileysEventMap,
    method: string = 'run'
): ClassDecorator {
    return function <T extends { new (...args: any[]): { client: Client } }>(
        constructor: T
    ) {
        return class extends constructor {
            constructor(...args: any[]) {
                super(...args)
                const instance = this as InstanceType<T>
                const handler = (
                    instance[method as keyof typeof instance] as (
                        eventName: string,
                        ...eventArgs: unknown[]
                    ) => void
                ).bind(instance)
                if (handler && typeof handler === 'function') {
                    instance.client.sock.ev.on(
                        event,
                        async (...eventArgs: unknown[]) => {
                            await (
                                handler as (
                                    ...args: unknown[]
                                ) => void | Promise<void>
                            )(...eventArgs)
                        }
                    )
                }
            }
        }
    } as ClassDecorator
}
