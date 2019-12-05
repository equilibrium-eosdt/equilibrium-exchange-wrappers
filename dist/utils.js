"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setTransactionParams(trxParams) {
    const parameters = {
        permission: "active",
        blocksBehind: 3,
        expireSeconds: 60
    };
    if (!trxParams)
        return parameters;
    if (trxParams.permission)
        parameters.permission = trxParams.permission;
    if (trxParams.blocksBehind)
        parameters.blocksBehind = trxParams.blocksBehind;
    if (trxParams.expireSeconds)
        parameters.expireSeconds = trxParams.expireSeconds;
    return parameters;
}
exports.setTransactionParams = setTransactionParams;
