import { IConnection } from "./interfaces/connection"
import { IExchangePair, IExchangeSettings, IExchangeToken } from "./interfaces/exchange"
import { ITrxParamsArgument } from "./interfaces/transaction"
import { setTransactionParams } from "./utils"

export class ExchangeContract {
    protected readonly contractName: string = "eos2dtdotcom"
    public readonly connection: IConnection

    constructor(connection: IConnection) {
        this.connection = connection
    }

    public getSettings = async (): Promise<IExchangeSettings> => {
        const table = await this.connection.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchsettings"
        })
        return table.rows[0]
    }

    public getAllPairs = async (): Promise<IExchangePair[]> => {
        const table = await this.connection.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchpairs",
            limit: 10_000
        })
        return table.rows
    }

    public getAllTokens = async (): Promise<IExchangeToken[]> => {
        const table = await this.connection.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchtokens",
            limit: 10_000
        })
        return table.rows
    }

    public getToken = async (
        tokenSymbol: string
    ): Promise<IExchangeToken | undefined> => {
        const tokens = await this.getAllTokens()
        return tokens.find(token => token.token_symbol.split(",")[1] === tokenSymbol)
    }

    public getPair = async (
        fromCurrency: string,
        toCurrency: string
    ): Promise<IExchangePair | undefined> => {
        const allPairs = await this.getAllPairs()
        return allPairs.find(pair => {
            const base = pair.base_currency.split(",")[1]
            const quote = pair.quote_currency.split(",")[1]
            return (
                (base === fromCurrency && quote == toCurrency) ||
                (base === toCurrency && quote == fromCurrency)
            )
        })
    }

    public exchange = async (
        sender: string,
        fromCurrency: string,
        toCurrency: string,
        amount: number,
        transactionParams?: ITrxParamsArgument
    ): Promise<any> => {
        const pair = await this.getPair(fromCurrency, toCurrency)
        if (!pair) throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`)

        const trxParams = setTransactionParams(transactionParams)
        const authorization = [{ permission: trxParams.permission, actor: sender }]

        const receipt = await this.connection.api.transact(
            {
                actions: [
                    {
                        account: await this.getTokenAccount(fromCurrency),
                        name: "transfer",
                        authorization,
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: await this.amountToAssetString(
                                amount,
                                fromCurrency
                            ),
                            memo: `{"pair_id": ${pair.pair_id}}`
                        }
                    }
                ]
            },
            {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            }
        )
        return receipt
    }

    public getExchangeRate = async (
        fromCurrency: string,
        toCurrency: string
    ): Promise<number | undefined> => {
        const pair = await this.getPair(fromCurrency, toCurrency)
        if (!pair) throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`)

        const pairBase = pair.base_currency.split(",")[1]

        let rate: number

        if (pair.price_type == 2) {
            rate =
                pairBase == fromCurrency
                    ? parseFloat(pair.price)
                    : 1.0 / parseFloat(pair.price)
        } else {
            const oracleName = "eosdtorclize"

            const rates = (
                await this.connection.rpc.get_table_rows({
                    code: oracleName,
                    scope: oracleName,
                    table: "orarates",
                    limit: 100
                })
            ).rows

            const ratesMap = new Map<string, number>()

            ratesMap.set("EOS", 1)
            for (const rateEntry of rates) {
                const symbol = rateEntry.rate.match(/[A-Z]+/g)![0]
                const value = parseFloat(rateEntry.rate)
                ratesMap.set(symbol, value)
            }

            // EOSDT rate is equal to USD
            const fromKey = fromCurrency === "EOSDT" ? "USD" : fromCurrency
            const toKey = toCurrency === "EOSDT" ? "USD" : toCurrency

            if (!(ratesMap.has(fromKey) && ratesMap.has(toKey))) {
                return undefined
            }

            rate = ratesMap.get(toKey)! / ratesMap.get(fromKey)!
        }

        const exchangeRate =
            rate *
            (pairBase == fromCurrency
                ? 1.0 - Number(pair.sell_slippage)
                : 1.0 / (1.0 + Number(pair.buy_slippage)))

        return exchangeRate
    }

    public getTokenAccount = async (assetSymbol: string): Promise<string> => {
        const token = await this.getToken(assetSymbol)
        if (token === undefined) throw new Error(`Unknown token symbol ${assetSymbol}`)
        return token.token_account
    }

    public amountToAssetString = async (
        amount: number | string,
        assetSymbol: string
    ): Promise<string> => {
        const token = await this.getToken(assetSymbol)
        if (token === undefined) throw new Error(`Unknown token symbol ${assetSymbol}`)
        const decimals = Number(token.token_symbol.split(",")[0])
        if (typeof amount === "string") amount = parseFloat(amount)
        assetSymbol = assetSymbol.toUpperCase()

        return `${amount.toFixed(decimals)} ${assetSymbol}`
    }
}
