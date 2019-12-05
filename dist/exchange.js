"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class ExchangeContract {
    constructor(connection) {
        this.contractName = "eos2dtdotcom";
        this.getSettings = () => __awaiter(this, void 0, void 0, function* () {
            const table = yield this.connection.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchsettings"
            });
            return table.rows[0];
        });
        this.getAllPairs = () => __awaiter(this, void 0, void 0, function* () {
            const table = yield this.connection.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchpairs",
                limit: 10000
            });
            return table.rows;
        });
        this.getAllTokens = () => __awaiter(this, void 0, void 0, function* () {
            const table = yield this.connection.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchtokens",
                limit: 10000
            });
            return table.rows;
        });
        this.getToken = (tokenSymbol) => __awaiter(this, void 0, void 0, function* () {
            const tokens = yield this.getAllTokens();
            return tokens.find(token => token.token_symbol.split(",")[1] === tokenSymbol);
        });
        this.getPair = (fromCurrency, toCurrency) => __awaiter(this, void 0, void 0, function* () {
            const allPairs = yield this.getAllPairs();
            return allPairs.find(pair => {
                const base = pair.base_currency.split(",")[1];
                const quote = pair.quote_currency.split(",")[1];
                return ((base === fromCurrency && quote == toCurrency) ||
                    (base === toCurrency && quote == fromCurrency));
            });
        });
        this.exchange = (sender, fromCurrency, toCurrency, amount, transactionParams) => __awaiter(this, void 0, void 0, function* () {
            const pair = yield this.getPair(fromCurrency, toCurrency);
            if (!pair)
                throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`);
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ permission: trxParams.permission, actor: sender }];
            const receipt = yield this.connection.api.transact({
                actions: [
                    {
                        account: yield this.getTokenAccount(fromCurrency),
                        name: "transfer",
                        authorization,
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: yield this.amountToAssetString(amount, fromCurrency),
                            memo: `{"pair_id": ${pair.pair_id}}`
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
        this.getExchangeRate = (fromCurrency, toCurrency) => __awaiter(this, void 0, void 0, function* () {
            const pair = yield this.getPair(fromCurrency, toCurrency);
            if (!pair)
                throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`);
            let rate;
            if (pair.price_type == 2) {
                rate =
                    pair.base_currency == fromCurrency
                        ? 1.0 / parseFloat(pair.price)
                        : parseFloat(pair.price);
            }
            else {
                const oracleName = "eosdtorclize";
                const rates = (yield this.connection.rpc.get_table_rows({
                    code: oracleName,
                    scope: oracleName,
                    table: "orarates",
                    limit: 100
                })).rows;
                const ratesMap = new Map();
                ratesMap.set("EOS", 1);
                for (const rateEntry of rates) {
                    const symbol = rateEntry.rate.match(/[A-Z]+/g)[0];
                    const value = parseFloat(rateEntry.rate);
                    ratesMap.set(symbol, value);
                }
                // EOSDT rate is equal to USD
                const fromKey = fromCurrency === "EOSDT" ? "USD" : fromCurrency;
                const toKey = toCurrency === "EOSDT" ? "USD" : toCurrency;
                if (!(ratesMap.has(fromKey) && ratesMap.has(toKey))) {
                    return undefined;
                }
                rate = ratesMap.get(toKey) / ratesMap.get(fromKey);
            }
            const exchangeRate = rate *
                (pair.base_currency == fromCurrency
                    ? 1.0 / (1.0 + Number(pair.buy_slippage))
                    : 1.0 - Number(pair.sell_slippage));
            return exchangeRate;
        });
        this.getTokenAccount = (assetSymbol) => __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getToken(assetSymbol);
            if (token === undefined)
                throw new Error(`Unknown token symbol ${assetSymbol}`);
            return token.token_account;
        });
        this.amountToAssetString = (amount, assetSymbol) => __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getToken(assetSymbol);
            if (token === undefined)
                throw new Error(`Unknown token symbol ${assetSymbol}`);
            const decimals = Number(token.token_symbol.split(",")[0]);
            if (typeof amount === "string")
                amount = parseFloat(amount);
            assetSymbol = assetSymbol.toUpperCase();
            return `${amount.toFixed(decimals)} ${assetSymbol}`;
        });
        this.connection = connection;
    }
}
exports.ExchangeContract = ExchangeContract;
