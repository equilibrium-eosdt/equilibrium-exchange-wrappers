import { Api, JsonRpc } from "eosjs"

export interface IConnection {
    rpc: JsonRpc
    api: Api
}
