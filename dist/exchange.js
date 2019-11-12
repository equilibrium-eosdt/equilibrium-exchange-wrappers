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
    constructor(connector) {
        this.rpc = connector.rpc;
        this.api = connector.api;
        this.contractName = "eosdtxchange";
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchsettings",
                json: true
            });
            return table.rows[0];
        });
    }
    getAllPairs() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchpairs",
                json: true,
                limit: 10000
            });
            return table.rows;
        });
    }
    getAllTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.rpc.get_table_rows({
                code: this.contractName,
                scope: this.contractName,
                table: "xchtokens",
                json: true,
                limit: 10000
            });
            return table.rows;
        });
    }
    getToken(tokenSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = yield this.getAllTokens();
            return tokens.find(token => token.token_symbol.split(",")[1] === tokenSymbol);
        });
    }
    getPair(fromCurrency, toCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPairs = yield this.getAllPairs();
            return allPairs.find(pair => {
                const base = pair.base_currency.split(",")[1];
                const quote = pair.quote_currency.split(",")[1];
                return ((base === fromCurrency && quote == toCurrency) ||
                    (base === toCurrency && quote == fromCurrency));
            });
        });
    }
    exchange(sender, fromCurrency, toCurrency, amount, transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const pair = yield this.getPair(fromCurrency, toCurrency);
            if (!pair)
                throw new Error(`Pair ${fromCurrency}/${toCurrency} does not exist`);
            const trxParams = utils_1.setTransactionParams(transactionParams);
            const authorization = [{ permission: trxParams.permission, actor: sender }];
            const type = pair.base_currency.split(",")[1] === fromCurrency ? "sell" : "buy";
            const receipt = yield this.api.transact({
                actions: [
                    {
                        account: utils_1.getTokenAccount(fromCurrency),
                        name: "transfer",
                        authorization,
                        data: {
                            from: sender,
                            to: this.contractName,
                            quantity: utils_1.amountToAssetString(amount, fromCurrency),
                            memo: `{"pair_id": ${pair.pair_id}, "type": "${type}"}`
                        }
                    }
                ]
            }, {
                blocksBehind: trxParams.blocksBehind,
                expireSeconds: trxParams.expireSeconds
            });
            return receipt;
        });
    }
}
exports.ExchangeContract = ExchangeContract;
