import { Api, JsonRpc } from "eosjs"
import { EosdtConnectorInterface } from "./interfaces/connector"
import { ExchangePair, ExchangeSettings, ExchangeToken } from "./interfaces/exchange"
import { ITrxParamsArgument } from "./interfaces/transaction"
import { amountToAssetString, getTokenAccount, setTransactionParams } from "./utils"

export class ExchangeContract {
    private contractName: string
    private rpc: JsonRpc
    private api: Api

    constructor(connector: EosdtConnectorInterface) {
        this.rpc = connector.rpc
        this.api = connector.api
        this.contractName = "eosdtxchange"
    }

    public async getSettings(): Promise<ExchangeSettings> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchsettings",
            json: true
        })
        return table.rows[0]
    }

    public async getAllPairs(): Promise<ExchangePair[]> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchpairs",
            json: true,
            limit: 10_000
        })
        return table.rows
    }

    public async getAllTokens(): Promise<ExchangeToken[]> {
        const table = await this.rpc.get_table_rows({
            code: this.contractName,
            scope: this.contractName,
            table: "xchtokens",
            json: true,
            limit: 10_000
        })
        return table.rows
    }

    public async getToken(tokenSymbol: string): Promise<ExchangeToken | undefined> {
        const tokens = await this.getAllTokens()
        return tokens.find(token => token.token_symbol.split(",")[1] === tokenSymbol)
    }

    public async getPair(
        fromCurrency: string,
        toCurrency: string
    ): Promise<ExchangePair | undefined> {
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
}
