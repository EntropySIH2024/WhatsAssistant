import { WACallEvent, proto } from '@whiskeysockets/baileys'

export type TEvent = {
    'new-call': (call: WACallEvent) => void
    'new-message': (message: proto.IWebMessageInfo) => void
    open: () => void
}
