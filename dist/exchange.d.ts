import { IConnection } from "./interfaces/connection";
import { IExchangePair, IExchangeSettings, IExchangeToken } from "./interfaces/exchange";
import { ITrxParamsArgument } from "./interfaces/transaction";
export declare class ExchangeContract {
    protected readonly contractName: string;
    readonly connection: IConnection;
    constructor(connection: IConnection);
    getSettings: () => Promise<IExchangeSettings>;
    getAllPairs: () => Promise<IExchangePair[]>;
    getAllTokens: () => Promise<IExchangeToken[]>;
    getToken: (tokenSymbol: string) => Promise<IExchangeToken | undefined>;
    getPair: (fromCurrency: string, toCurrency: string) => Promise<IExchangePair | undefined>;
    exchange: (sender: string, fromCurrency: string, toCurrency: string, amount: number, transactionParams?: ITrxParamsArgument | undefined) => Promise<any>;
    getExchangeRate: (fromCurrency: string, toCurrency: string) => Promise<number | undefined>;
    getTokenAccount: (assetSymbol: string) => Promise<string>;
    amountToAssetString: (amount: string | number, assetSymbol: string) => Promise<string>;
}
