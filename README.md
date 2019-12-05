# @equilab/exchange

Package of wrappers to work with EOS contract equiexchange.

## Usage

Install the module using NPM:

```bash
$ npm install @equilab/exchange
```

```Javascript
const { ExchangeContract, Connection } = require("@equilab/exchange")

const nodeAddress = "http://node-address.example.com:80"
const connection = new Connection(nodeAddress, ["private-key-1", "private-key-2"])
const exchange = new ExchangeContract(connection)
```

## Methods

-   `exchange` - exchange a given amount of currency.
-   `getPair` - returns currency pair object for given currencies.
-   `getAllPairs` - returns an array of all currency pairs objects.
-   `getToken` - returns token object for specified currency.
-   `getAllTokens` - returns an array of all currency tokens.
-   `getSettings` - return Exchange contract settings.
-   `getExchangeRate` - return exchange rate between two currencies.

## Examples

### Connecting to blockchain

This code block is required for any other example to work.

```Javascript
const { ExchangeContract, Connection } = require("@equilab/exchange")

// Change node address here. This one will connect you to Jungle testnet node
const nodeAddress = "http://jungle2.cryptolions.io:80"

// Change or add private keys used to sign transactions here. This one is from Jungle
// testnet account "exampleaccnt"
const privateKeys = ["5J5ks3bbRNtQFm7cZwJ6mbiWQoxoMtUDzLG7BAtcmagi5h9Mp5N"]
const accountName = "exampleaccnt"

const connection = new Connection(nodeAddress, privateKeys)
const exchange = new ExchangeContract(connection)

// This code logs current block number and lets us know that connection
// has been  established.
const currentBlockNumber = (await exchange.connection.rpc.get_info()).head_block_num
console.log(`Connected to blockchain, current block number is: ${currentBlockNumber}`)
```

### Exchanging EOS

```Javascript
// Exchanging 10 EOS to EOSDT
await exchange.exchange(accountName, "EOS", "EOSDT", 10)
```

### Exchange rates

```Javascript
// Getting current conversion rate from EOS to EOSDT
let rate = await exchange.getExchangeRate("EOS", "EOSDT")
```
