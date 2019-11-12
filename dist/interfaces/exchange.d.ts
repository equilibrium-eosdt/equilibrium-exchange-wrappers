export interface IExchangePair {
    pair_id: number;
    base_currency: string;
    quote_currency: string;
    total_base_balance: string;
    total_quote_balance: string;
    buy_slippage: number;
    sell_slippage: number;
    price_currency: string;
    price_type: 0 | 1;
}
export interface IExchangeSettings {
    oraclize_account: string;
    manager_account: string;
    rates_timeout: number;
    settings_id: number;
}
export interface IExchangeToken {
    token_symbol: string;
    token_account: string;
}
