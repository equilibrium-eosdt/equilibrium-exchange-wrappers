import { Api, JsonRpc } from "eosjs"
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig"
import Fetch from "node-fetch"
import { TextDecoder, TextEncoder } from "text-encoding"
import { IConnection } from "./interfaces/connection"

export class Connection implements IConnection {
    public readonly rpc: JsonRpc
    public readonly api: Api

    constructor(nodeAddress: string, privateKeys: string[]) {
        const fetch: any = Fetch // Workaround to avoid incompatibility of fetch types in 'eosjs' and 'node-fetch'
        this.rpc = new JsonRpc(nodeAddress, { fetch })
        const signatureProvider = new JsSignatureProvider(privateKeys)
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder()
        })
    }
}
