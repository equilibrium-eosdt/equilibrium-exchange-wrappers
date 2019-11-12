import { EosdtConnectorInterface } from "./interfaces/connector";
import { ExchangePair, ExchangeSettings, ExchangeToken } from "./interfaces/exchange";
import { ITrxParamsArgument } from "./interfaces/transaction";
export declare class ExchangeContract {
    private contractName;
    private rpc;
    private api;
    constructor(connector: EosdtConnectorInterface);
    getSettings(): Promise<ExchangeSettings>;
    getAllPairs(): Promise<ExchangePair[]>;
    getAllTokens(): Promise<ExchangeToken[]>;
    getToken(tokenSymbol: string): Promise<ExchangeToken | undefined>;
    getPair(fromCurrency: string, toCurrency: string): Promise<ExchangePair | undefined>;
    exchange(sender: string, fromCurrency: string, toCurrency: string, amount: number, transactionParams?: ITrxParamsArgument): Promise<any>;
}
