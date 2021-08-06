export const txMock = {
    transfer: {
        amount: 100,
        recipient: 'alias:T:merry',

        // debug
        // timestamp: Date.now(),
        // fee: 1,
        attachment: ""
    },
    invoke: {
        dApp: "3N77kfPbQyjXWpDALX3xjKw3iEGMWEctV37",
        call: {
         function: "exchange",
         args: [
          {
           type: "integer",
           value: "14014677"
          }
         ]
        },
        payment: [
         {
          assetId: "WAVES",
          amount: "100000000"
         }
        ],

        // debug
        // timestamp: Date.now(),
        // fee: 1,
    }
}