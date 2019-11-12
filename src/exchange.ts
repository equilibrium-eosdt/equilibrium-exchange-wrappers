import { Api, JsonRpc } from "eosjs"
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig"
import Fetch from "node-fetch"
import { IExchangePair, IExchangeSettings, IExchangeToken } from "./interfaces/exchange"
import { ITrxParamsArgument } from "./interfaces/transaction"
import { amountToAssetString, getTokenAccount, setTransactionParams } from "./utils"

export class ExchangeContract {
    private readonly contractName: string = "equiexchange"
    public readonly rpc: JsonRpc
    public readonly api: Api

    constructor(nodeAddress: string, privateKeys: string[]) {
        const fetch: any = Fetch // Workaroung to avoid incompatibility of fetch types in 'eosjs' and 'node-fetch'
        this.rpc = new JsonRpc(nodeAddress, { fetch })
        const signatureProvider = new JsSignatureProvider(privateKeys)
        this.api = new Api({
            rpc: this.rpc,
            signatureProvider,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder()
        })
    }

    public async getSettings(): Promise<IExchangeSettings> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchsettings"
        })
        return table.rows[0]
    }

    public async getAllPairs(): Promise<IExchangePair[]> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchpairs",
            limit: 10_000
        })
        return table.rows
    }

    public async getAllTokens(): Promise<IExchangeToken[]> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchtokens",
            limit: 10_000
        })
        return table.rows
    }

    public async getToken(tokenSymbol: string): Promise<IExchangeToken | undefined> {
        const tokens = await this.getAllTokens()
        return tokens.find(token => token.token_symbol.split(",")[1] === tokenSymbol)
    }

    public async getPair(
        fromCurrency: string,
        toCurrency: string
    ): Promise<IExchangePair | undefined> {
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

    public async exchange(
        sender: string,
        fromCurrency: string,
        toCurrency: string,
        amount: number,
        transactionParams?: ITrxParamsArgument
    ): Promise<any> {
        const pair = await this.getPair(fromCurrency, toCurrency)
        if (!pair) throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`)

        const trxParams = setTransactionParams(transactionParams)
        const authorization = [{ permission: trxParams.permission, actor: sender }]
        const type = pair.base_currency.split(",")[1] === fromCurrency ? "sell" : "buy"
        const receipt = await this.api.transact(
            {
                actions: [
                    {
                        account: getTokenAccount(fromCurrency),
                        name: "transfer",
                        authorization,
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: amountToAssetString(amount, fromCurrency),
                            memo: `{"pair_id": ${pair.pair_id}, "type": "${type}"}`
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

    public async getExchangeRate(
        fromCurrency: string,
        toCurrency: string
    ): Promise<number | undefined> {
        const pair = await this.getPair(fromCurrency, toCurrency)
        if (!pair) throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`)

        const oracleName = "eosdtorclize"

        const rates = (
            await this.rpc.get_table_rows({
                code: oracleName,
                scope: oracleName,
                table: "orarates",
                limit: 100
            })
        ).rows

        let ratesMap = new Map<string, number>()

        ratesMap.set("EOS", 1)
        for (const rate of rates) {
            const symbol = rate.rate.match(/[A-Z]+/g)![0]
            const value = parseFloat(rate.rate)
            ratesMap.set(symbol, value)
        }

        const fromKey = fromCurrency === "EOSDT" ? "USD" : fromCurrency
        const toKey = toCurrency === "EOSDT" ? "USD" : toCurrency

        if (!(ratesMap.has(fromKey) && ratesMap.has(toKey))) {
            return undefined
        }

        let rate = ratesMap.get(fromKey)! / ratesMap.get(toKey)!

        rate *=
            pair.base_currency == fromCurrency
                ? 1 - pair.sell_slippage
                : 1.0 / (1 + pair.buy_slippage)

        return rate
    }
}
