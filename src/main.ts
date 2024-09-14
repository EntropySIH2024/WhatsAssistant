import { Client } from './structures'
;(async (): Promise<void> => {
    await new Client().start()
})()
