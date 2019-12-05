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
