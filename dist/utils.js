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
function amountToAssetString(amount, assetSymbol) {
    if (typeof amount === "string")
        amount = parseFloat(amount);
    assetSymbol = assetSymbol.toUpperCase();
    let decimals;
    if (assetSymbol === "EOS")
        decimals = 4;
    else if (assetSymbol === "EOSDT" || assetSymbol === "NUT")
        decimals = 9;
    else
        throw new Error(`${amountToAssetString.name}(): unknown interface
    interfacesymbol ${assetSymbol}`);
    return `${amount.toFixed(decimals)} ${assetSymbol}`;
}
exports.amountToAssetString = amountToAssetString;
function getTokenAccount(assetSymbol) {
    switch (assetSymbol) {
        case "NUT":
            return "eosdtnutoken";
        case "EOS":
            return "eosio.token";
        case "EOSDT":
            return "eosdtsttoken";
    }
    throw new Error(`Unknown token symbol ${assetSymbol}`);
}
exports.getTokenAccount = getTokenAccount;
