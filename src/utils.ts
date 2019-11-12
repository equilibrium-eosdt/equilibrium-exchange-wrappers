import { ITrxParams, ITrxParamsArgument } from "./interfaces/transaction"

export function setTransactionParams(trxParams?: ITrxParamsArgument): ITrxParams {
    const parameters: ITrxParams = {
        permission: "active",
        blocksBehind: 3,
        expireSeconds: 60
    }

    if (!trxParams) return parameters

    if (trxParams.permission) parameters.permission = trxParams.permission
    if (trxParams.blocksBehind) parameters.blocksBehind = trxParams.blocksBehind
    if (trxParams.expireSeconds) parameters.expireSeconds = trxParams.expireSeconds
    return parameters
}

export function amountToAssetString(
    amount: number | string,
    assetSymbol: string
): string {
    if (typeof amount === "string") amount = parseFloat(amount)
    assetSymbol = assetSymbol.toUpperCase()

    let decimals
    if (assetSymbol === "EOS") decimals = 4
    else if (assetSymbol === "EOSDT" || assetSymbol === "NUT") decimals = 9
    else
        throw new Error(`${amountToAssetString.name}(): unknown interface
    interfacesymbol ${assetSymbol}`)

    return `${amount.toFixed(decimals)} ${assetSymbol}`
}

export function getTokenAccount(assetSymbol: string): string {
    switch (assetSymbol) {
        case "NUT":
            return "eosdtnutoken"
        case "EOS":
            return "eosio.token"
        case "EOSDT":
            return "eosdtsttoken"
    }
    throw new Error(`Unknown token symbol ${assetSymbol}`)
}
