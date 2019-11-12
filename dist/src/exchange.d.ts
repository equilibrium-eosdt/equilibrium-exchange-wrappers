import { Api, JsonRpc } from "eosjs";
import { ExchangePair, ExchangeSettings, ExchangeToken } from "./interfaces/exchange";
import { ITrxParamsArgument } from "./interfaces/transaction";
export declare class ExchangeContract {
    private readonly contractName;
    readonly rpc: JsonRpc;
    readonly api: Api;
    constructor(nodeAddress: string, privateKeys: string[]);
    getSettings(): Promise<ExchangeSettings>;
    getAllPairs(): Promise<ExchangePair[]>;
    getAllTokens(): Promise<ExchangeToken[]>;
    getToken(tokenSymbol: string): Promise<ExchangeToken | undefined>;
    getPair(fromCurrency: string, toCurrency: string): Promise<ExchangePair | undefined>;
    exchange(sender: string, fromCurrency: string, toCurrency: string, amount: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    getRate(fromCurrency: string, toCurrency: string): Promise<number | undefined>;
}
