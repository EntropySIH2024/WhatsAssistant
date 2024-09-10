import makeWASocket, {
    UserFacingSocketConfig,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    WAMessageKey,
    proto
} from '@whiskeysockets/baileys'
import chalk, { ChalkInstance } from 'chalk'
import EventEmitter from 'events'
import TypedEventEmitter from 'typed-emitter'
import { join } from 'path'
import moment from 'moment'
import P from 'pino'
import NodeCache from 'node-cache'
import { IConfig, UnwrapPromise } from '../typings'

export class Client extends (EventEmitter as new () => TypedEventEmitter<{}>) {
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
            [K in keyof ChalkInstance]: ChalkInstance[K] extends (
                ...args: [string, ...string[]]
            ) => string
                ? K
                : never
        }[keyof ChalkInstance] = 'greenBright'
    ): void {
        console.log(
            chalk.magentaBright(moment().format('YYYY/MM/DD HH:mm:ss')),
            chalk[color]('['.concat(level.toUpperCase(), ']')),
            '-',
            message
        )
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
        return this.sock
    }

    public sock!: ReturnType<typeof makeWASocket>
    public session!: UnwrapPromise<typeof useMultiFileAuthState>
    private readonly cache = new NodeCache()
}
