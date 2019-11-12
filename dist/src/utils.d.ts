import { ITrxParams, ITrxParamsArgument } from "./interfaces/transaction";
export declare function setTransactionParams(trxParams?: ITrxParamsArgument): ITrxParams;
export declare function amountToAssetString(amount: number | string, assetSymbol: string): string;
export declare function getTokenAccount(assetSymbol: string): string;
export declare function balanceToNumber(balance: string): number;
