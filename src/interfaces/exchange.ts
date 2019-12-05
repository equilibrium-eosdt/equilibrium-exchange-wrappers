export interface IExchangePair {
    pair_id: number
    base_currency: string
    quote_currency: string
    total_base_balance: string
    total_quote_balance: string
    buy_slippage: string
    sell_slippage: string
    price_currency: string
    price_type: 0 | 1 | 2
    manager_account: string
    price: string
}

export interface IExchangeSettings {
    oraclize_account: string
    rate_timeout: number
    settings_id: number
    next_trade_id: number
}

export interface IExchangeToken {
    token_symbol: string
    token_account: string
}
