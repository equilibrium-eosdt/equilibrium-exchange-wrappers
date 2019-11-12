import { Api, JsonRpc } from "eosjs";
import { IExchangePair, IExchangeSettings, IExchangeToken } from "./interfaces/exchange";
import { ITrxParamsArgument } from "./interfaces/transaction";
export declare class ExchangeContract {
    private readonly contractName;
    readonly rpc: JsonRpc;
    readonly api: Api;
    constructor(nodeAddress: string, privateKeys: string[]);
    getSettings(): Promise<IExchangeSettings>;
    getAllPairs(): Promise<IExchangePair[]>;
    getAllTokens(): Promise<IExchangeToken[]>;
    getToken(tokenSymbol: string): Promise<IExchangeToken | undefined>;
    getPair(fromCurrency: string, toCurrency: string): Promise<IExchangePair | undefined>;
    exchange(sender: string, fromCurrency: string, toCurrency: string, amount: number, transactionParams?: ITrxParamsArgument): Promise<any>;
    getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | undefined>;
}
