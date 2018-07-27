# Waves sign data by ledger in browser

## Install

```
$ npm install --save @waves/ledger
```

## Usage

#####Create connection
```js
const WavesLedger = require('@Waves/ledger');
const ledger = new WavesLedger();
```
####Get user by id
```js
ledger.getUserDataById(id)
    .then(
        (user) => {...},
        (err) => {...}
    );
```
> user = { id, path, wavesAddress, publicKey } 

Id - is number from 0<br>
Path - is string in internal ledger format<br>
wavesAddress - is string in base58 format<br>
publicKey - is string in base58 format<br>

####Sign data by id
You can sign 4 data types
```js
ledger.signTransaction(userId, asset, data)
```
userId - number<br>
data - Array<uInt8> number form 0 to 255
asset - {precision: number, ...} 
```js
ledger.signSomeData(userId, data)
```
userId - number<br>
data - Array<uInt8> number form 0 to 255
```js
ledger.signRequest(userId, data)
```
userId - number<br>
data - Array<uInt8> number form 0 to 255
```js
ledger.signMessage(userId, data)
```
userId - number<br>
data - string

All methods return Promise with result signature string in base58 format
