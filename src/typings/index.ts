export * from './config'
export * from './events'

export type UnwrapPromise<T extends (...args: never[]) => Promise<unknown>> =
    T extends (...args: never[]) => Promise<infer U> ? U : never
