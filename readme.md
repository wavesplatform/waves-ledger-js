# Bancoin sign data by ledger in browser

## Install

```
$ npm install --save @bancoin/ledger
```

## Usage

##### Create connection
```js
const BancoinLedger = require('@Bancoin/ledger');
const ledger = new BancoinLedger();
```
`BancoinLedger` can have optional arguments.

```js
    import TransportNodeHid from '@ledgerhq/hw-transport-node-u2f';

    const options = {
        debug: true, //boolean,
        openTimeout: 3000, //number,
        listenTimeout: 30000, //number,
        exchangeTimeout: 30000, //number,
        networkCode: 87, //number,
        transport: TransportNodeHid
    };

    const ledger = new BancoinLedger(options);
```
 
##### Where: 
`debug` enable or not logs of the binary exchange.
`openTimeout` is a delay number in ms for waiting connection.    
`listenTimeout` is a delay number in ms for waiting listen request to U2F device.    
`exchangeTimeout` is a timeout (in milliseconds) for the exchange call. Only some transport might implement it. (e.g. U2F).    
`networkCode` is Bancoin network code (87 - for mainet)  
`transport` is U2F Transport implementation. (hw-transport-u2f by default) 
+ [@ledgerhq/hw-transport-u2f](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-u2f) 
+ [@ledgerhq/hw-transport-webusb](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-webusb) 
+ [@ledgerhq/hw-transport-web-ble](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-web-ble) 
+ [@ledgerhq/hw-transport-http](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-http) 

[Read about transport](https://github.com/LedgerHQ/ledgerjs)

### BancoinLedger API



+ ##### probeDevice
    
    probeDevice(): Promise<boolean>. If device available and ready, Promise returned true.
    
    ```js
      const canIUse = async () => {
          return await ledger.probeDevice();
      }
    ```
+ ##### tryConnect

    tryConnect(): Promise<>. reconnect to Transport and init ledger libs.

    ```js
      const isLedgerReady = async () => {
          try {
              return await ledger.tryConnect();
          } catch (e) {
              ///...error handlers
          }
      };

+ ##### getUserDataById
     getUserDataById(id): Promise<user>. Get user from ledger, where user is:
     `{ id: number, path: string, BancoinAddress: string, publicKey: string }` 

     id - is number from 0  
     path - is string in internal ledger format  
     BancoinAddress - is string in base58 format  
     publicKey - is string in base58 format  
     
    ```js
    ledger.getUserDataById(id)
        .then(
            (user) => {...},
            (err) => {...}
        );
    ```

+ ##### signTransaction
    Sign Bancoin transaction bytes (ledger show detailed transaction info)
    ```js
        ledger.signTransaction(userId, asset, data)
    ```
    userId - number<br>
    data - Array<uInt8> number form 0 to 255
    asset - {precision: number, ...}
    
    Result is Promise with signature string in base58 format

+ ##### signSomeData     
    Sign any bytes (ledger can't show detail info)
    ```js
      ledger.signSomeData(userId, data)
    ```
    userId - number<br>
    data - Array<uInt8> number form 0 to 255
    
    Result is Promise with signature string in base58 format
    
+ ##### signRequest   
    
    Sign any bytes (ledger can't show detail info)
    
    ```js
      ledger.signRequest(userId, data)
    ```
    userId - number<br>
    data - Array<uInt8> number form 0 to 255
    
    Result is Promise with signature string in base58 format
    
+ ##### signMessage      
    Sign any string (ledger can't show detail info)

    ```js
    ledger.signMessage(userId, data)
    ```
    userId - number<br>
    data - string
    
    Result is Promise with signature string in base58 format
