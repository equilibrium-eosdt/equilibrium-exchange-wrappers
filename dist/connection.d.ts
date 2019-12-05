import { Api, JsonRpc } from "eosjs";
import { IConnection } from "./interfaces/connection";
export declare class Connection implements IConnection {
    readonly rpc: JsonRpc;
    readonly api: Api;
    constructor(nodeAddress: string, privateKeys: string[]);
}
