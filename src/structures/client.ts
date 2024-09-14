import makeWASocket, {
    UserFacingSocketConfig,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    WAMessageKey,
    proto
} from '@whiskeysockets/baileys'
import chalk from 'chalk'
import EventEmitter from 'events'
import TypedEventEmitter from 'typed-emitter'
import { join } from 'path'
import moment from 'moment'
import P from 'pino'
import NodeCache from 'node-cache'
import { IConfig, TEvent, UnwrapPromise } from '../typings'
import { readdir, rmdir, unlink } from 'fs-extra'
import {
    BaileysCall,
    ConnectionUpdate,
    CredsUpdate,
    MessagesUpsert,
    Open
} from './events'
import { Call, Message } from '../interactions'

export class Client extends (EventEmitter as new () => TypedEventEmitter<TEvent>) {
    constructor(
        public readonly config: IConfig = {
            google_cloud_credentials_path: join(
                __dirname,
                '..',
                '..',
                'google_cloud_credentials.json'
            ),
            session_dir: join(__dirname, '..', '..', 'bot_session'),
            openai_api_key: ''
        }
    ) {
        super()
    }

    public log(
        message: string,
        level: string = 'WHATS-ASSISTANT',
        color: {
            [K in keyof typeof chalk]: (typeof chalk)[K] extends (
                ...args: [string, ...string[]]
            ) => string
                ? K
                : never
        }[keyof typeof chalk] = 'greenBright'
    ): void {
        console.log(
            chalk.magentaBright(moment().format('YYYY/MM/DD HH:mm:ss')),
            chalk[color]('['.concat(level.toUpperCase(), ']')),
            '-',
            message
        )
    }

    private registerEvents = () =>
        [
            ConnectionUpdate,
            CredsUpdate,
            Open,
            MessagesUpsert,
            BaileysCall,
            Call,
            Message
        ].forEach((x) => new x(this))

    public async deleteSession(): Promise<void> {
        this.log(
            "Deleting the session directory as you're already logged out from it.",
            'connection',
            'greenBright'
        )
        const files = await readdir(this.config.session_dir)
        for (const filename of files)
            await unlink(join(this.config.session_dir, filename))
        await rmdir(this.config.session_dir)
        this.log('Session deleted successfully.', 'connection', 'greenBright')
    }

    public async start(): Promise<ReturnType<typeof makeWASocket>> {
        this.session = await useMultiFileAuthState(this.config.session_dir)
        const { version } = await fetchLatestBaileysVersion()
        const logger = P({ level: 'silent' }) as unknown as Exclude<
            UserFacingSocketConfig['logger'],
            undefined
        >
        this.sock = makeWASocket({
            printQRInTerminal: true,
            version,
            logger,
            auth: {
                creds: this.session.state.creds,
                keys: makeCacheableSignalKeyStore(
                    this.session.state.keys,
                    logger
                )
            },
            msgRetryCounterCache: this.cache,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: true,
            qrTimeout: 60 * 1000,
            getMessage: async (key: WAMessageKey) =>
                proto.Message.fromObject({})
        })
        this.registerEvents()
        return this.sock
    }

    public sock!: ReturnType<typeof makeWASocket>
    public session!: UnwrapPromise<typeof useMultiFileAuthState>
    private readonly cache = new NodeCache()
}
