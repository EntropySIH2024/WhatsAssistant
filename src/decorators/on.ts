import { Client } from '../structures'
import { TEvent } from '../typings'

export function On(
    event: keyof TEvent,
    once: boolean = false,
    method: string = 'run'
): ClassDecorator {
    return function <
        T extends {
            new (...args: ConstructorParameters<typeof Client>): {
                client: Client
            }
        }
    >(constructor: T) {
        return function (...args: ConstructorParameters<typeof Client>) {
            const instance = new constructor(...args)
            const handler = (
                instance[method as keyof typeof instance] as unknown as (
                    eventName: string,
                    ...eventArgs: unknown[]
                ) => void
            ).bind(instance)
            if (handler && typeof handler === 'function') {
                instance.client[once ? 'once' : 'on'](
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
    } as ClassDecorator
}
