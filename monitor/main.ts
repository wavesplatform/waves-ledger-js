// @ts-nocheck
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { verifySignature } from '@waves/ts-lib-crypto'
import { Signer } from '@waves/signer';
import { ProviderLedger } from '@waves/provider-ledger';
import { WavesLedger } from '../src/WavesLedger';
import { signTx, makeTxBytes } from "@waves/waves-transactions";
// import { ThemeConsumer } from 'styled-components';
// import { isConstructorDeclaration } from 'typescript';

export function main() {

const DEFAULT_NODE_URL = 'https://nodes-testnet.wavesnodes.com'; // Specify URL of the node on Testnet
const DEFAULT_NETWORK_CODE = 68; // 82

const TEST_DATA_URL = './testdata.json';
const Transport = TransportWebUSB;

const appData: any = {
    _ledger: null,
    _testData: null,

    selectedTxIndex: null,
    signer: null,
    defaultUser: null,
    users: [],

    ledger: function() { return this._ledger; },
    getTestData: function() { return this._testData; },
    loadTestData: function() {
        if(this._testData) {
            return Promise.resolve(this._testData);
        } else {
            return fetch(`${TEST_DATA_URL}?${Date.now()}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    appData._testData = data;

                    return data;
                })
                .then((data) => {
                    const txList = data.tx.proto;

                    txListEL.innerHTML = txList
                        .map((tx, index) => {
                            const text = `T: ${tx.dataType} V: ${tx.dataVersion} A: ${tx.amountPrecision} F: ${tx.feePrecision}`;
                            const option = `<option value="${index}">${text}</option>`;

                            return option;
                        })
                        .join('');

                        txListEL.value = null;
                })
            
        }        
    }
};

const statusEl = document.querySelector('.device-status');
const initDeviceBtn = document.querySelector('.device-init');
const nextUsersEl = document.querySelector('.users-list-next');
const hideUserList: HTMLInputElement = document.querySelector('.hide-user-list');
const errorEl = document.querySelector('.error');
const errorButton = document.querySelector('.error button');

const autoTestButton = document.querySelector('.autotest');
const autoTestEl = document.querySelector('.autotest-data');
const signerLogEl = document.querySelector('.signer-log');
const protoTxTestBut = document.querySelector('.proto-tx');
const byteTxTestBut = document.querySelector('.byte-tx');
const protoOrderTestBut = document.querySelector('.proto-order');
const byteOrderTestBut = document.querySelector('.byte-order');
const requestTestBut = document.querySelector('.request');
const customDataTestBut = document.querySelector('.custom-data');
const messageTestBut = document.querySelector('.message');

const signerInitBtn = document.querySelector('.signer-init');
const signerSignBtn = document.querySelector('.signer-sign');
const txListEL = document.querySelector('.tx-list');
const txPreviewEl = document.querySelector('.tx-preview-json');
const txPreviewIdEl = document.querySelector('.tx-preview-id');

const usersListEl = document.querySelector('.users-list');

const buttons = {
    all: autoTestButton,
    protoTx: protoTxTestBut,
    byteTx: byteTxTestBut,
    protoOrder: protoOrderTestBut,
    byteOrder: byteOrderTestBut,
    request: requestTestBut,
    custom: customDataTestBut,
    message: messageTestBut
};

initDeviceBtn.addEventListener('click', initDevice);
autoTestButton.addEventListener('click', autoTest);
nextUsersEl.addEventListener('click', getNextUsers);
usersListEl.addEventListener('click', _selectUser);

signerInitBtn.addEventListener('click', signerInit);
signerSignBtn.addEventListener('click', signerSignTx);
txListEL.addEventListener('change', onChangeTxList);

protoTxTestBut.addEventListener('click', function(){
    testOne('protoTx');
});
byteTxTestBut.addEventListener('click', function(){
    testOne('byteTx');
});
protoOrderTestBut.addEventListener('click', function(){
    testOne('protoOrder');
});
byteOrderTestBut.addEventListener('click', function(){
    testOne('byteOrder');
});
requestTestBut.addEventListener('click', function(){
    testOne('request');
});
customDataTestBut.addEventListener('click', function(){
    testOne('custom');
});
messageTestBut.addEventListener('click', function(){
    testOne('message');
});
errorButton.addEventListener('click', _toggleShowError);

hideUserList.addEventListener('change', () => {
    if(!!hideUserList.checked) {
        usersListEl.classList.add('hidden');
    } else {
        usersListEl.classList.remove('hidden');
    }
});

function initDevice() {
    if(appData._ledger) {
        return;
    }

    const ledger = new WavesLedger({
        debug: true,
        openTimeout: 3000,
        listenTimeout: 30000,
        exchangeTimeout: 30000,
        networkCode: DEFAULT_NETWORK_CODE,
        transport: Transport
    });

    appData._ledger = ledger;

    return ledger.tryConnect()
        .then(() => {
            return checkConnect();
        })
        .then(() => {
            return appData.ledger().getUserDataById(0)
                .then((user) => {
                    appData.defaultUser = user;
                })
        })
}

function signerInit() {
    const signer = new Signer({
        NODE_URL: DEFAULT_NODE_URL,
    });
    const provider = new ProviderLedger();

    provider.ledgerConfig({
        networkCode: DEFAULT_NETWORK_CODE
    });

    signer.setProvider(provider);

    appData.signer = signer;
}

async function signerSignTx() {
    // const tx = {"id":"AiCWg4DTqgr5AKCYdD4M7hHDvVPg9ojM986CZwYmBTHT","type":15,"version":2,"chainId":68,"senderPublicKey":"HXs9rwQW9CGM2KXkxMoubwnhWypCa2LtH1JEJkZa9yDF","sender":"3Fe3oGLjrxJasvgLyEVHEfA3ryMF3G9BEhX","assetId":"E5Rcha533YfMJZE9aDmx2m5tZSYYt6HWgFU3jkP4YGDV","script":"base64:AwZd0cYf","fee":100000000,"feeAssetId":null,"timestamp":1601366036889,"proofs":["5uvrjcUikMPipfxbQtAQEqFcwVz14Kcn7pACKPxAU7zs2ttK2szcBSoDviVqzK2i5qXbzFAwvyoxyXmuChVDaA6s"]};

    // if(appData.signer == null) {
    //     signerInit();
    // }

    // appData.signer.login()
    //     .then(() => {
    //         appData.signer
    //         .transfer({ amount: 100000000, recipient: 'alias:T:merry' })
    //         .sign()
    //         .then((data) => {
    //             const [signedTransfer] = data;
    
    //             console.log('Sign');
    //             console.log(signedTransfer);
    //         });
    //     });

    if (appData.selectedTxIndex == null) {
        alert('Select tx');
    }

    function str2buf(str) {
        var enc = new TextEncoder(); // always utf-8
        return enc.encode(str);
    }

    // ITS WORK
    await initDevice();

    const index = appData.selectedTxIndex;
    const tx = appData.getTestData().tx.proto[index];

    let originalTx = origTx(tx.jsonView);
    let publicKey = appData.defaultUser.publicKey;

    let signedTx = signTx(originalTx, publicKey);
    let dataBuf = makeTxBytes(originalTx);

    let userId = 0; //userData.id;

    const dataType = tx.jsonView.type; // tx type
    const dataVersion = tx.jsonView.version; // tx version

    signerLogEl.innerHTML += `TxId: ${signedTx.id} (@waves/waves-transactions :: signTx)<br />`;

    let sign = await appData.ledger().signTransaction(userId, {
        dataType: dataType,
        dataVersion: dataVersion,
        dataBuffer: dataBuf,
    });

    signerLogEl.innerHTML += 'Signer result: ' + sign + '<br />';
    
    if (verifySignature(publicKey, dataBuf, sign)) {
        signerLogEl.innerHTML += 'PASS<br />*<br />';
    } else {
        signerLogEl.innerHTML += 'NOT PASS<br />*<br />';
    }
}

function onChangeTxList(ev) {
    const value = Number(ev.target.value);
    const tx = appData.getTestData().tx.proto[value];
    
    appData.selectedTxIndex = value;

    let originalTx = origTx(tx.jsonView);
    let publicKey = appData.defaultUser.publicKey;

    let signedTx = signTx(originalTx, publicKey);

    txPreviewIdEl.innerHTML = signedTx.id;
    txPreviewEl.value = JSON.stringify(tx, null, ' ');

    document.querySelector('.tx-preview-container').classList.remove('hidden');
}

function checkConnect() {
    statusEl.classList.add('loading');
    nextUsersEl.setAttribute('disable', 'true');

    return appData.ledger().probeDevice().then((status) => {
        appData.status = status ? true : false;
        if(appData.status) {
            statusEl.classList.add('on');
            statusEl.classList.remove('off');
        } else{
            statusEl.classList.add('off');
            statusEl.classList.remove('on');
        }

        if (!status) {
            showError();
            nextUsersEl.setAttribute('disable', 'true');
        } else {
            nextUsersEl.setAttribute('disable', 'false');
        }
        statusEl.classList.remove('loading');
    });
}

async function autoTest() {
    let userData = appData.users[appData.selectedUser];
    const testData = appData.getTestData();

    statusEl.classList.add('loading');

    disableButtons();
    destroyTestData();

    if(userData === null || userData === undefined) {
        userData = await appData.ledger().getUserDataById(0);
    }

    autoTestEl.append(" Start Testing\n");
    autoTestEl.append("-------------------------------\n\n");

    // testing txs
    if(testData.tx.proto.length > 0) {
        await testProtoTxs(testData.tx.proto, userData);
    }
    if(testData.tx.old.length > 0) {
        await testOldTxs(testData.tx.old, userData);
    }
    if(testData.order.proto.length > 0) {
        await testProtoOrder(testData.order.proto, userData);
    }
    if(testData.order.old.length > 0) {
        await testByteOrder(testData.order.old, userData);
    }
    if(testData.request.length > 0) {
        await testRequest(testData.request, userData);
    }
    if(testData.customeData.length > 0) {
        await testCustomData(testData.customeData, userData);
    }
    if(testData.message.length > 0) {
        await testMessage(testData.message, userData);
    }

    statusEl.setAttribute('loading', 'false');
    enableButtons();
}

async function testOne(type) {
    let userData = appData.users[appData.selectedUser];
    const testData = appData.getTestData();

    destroyTestData();
    disableButtons();
    autoTestEl.append(" Start Test\n");
    autoTestEl.append("-------------------------------\n\n");
    statusEl.setAttribute('loading', 'true');
    switch (type) {
        case 'protoTx':
            if(testData.tx.proto.length > 0) {
                await testProtoTxs(testData.tx.proto, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'byteTx':
            if(testData.tx.old.length > 0) {
                await testOldTxs(testData.tx.old, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'protoOrder':
            if(testData.order.proto.length > 0) {
                await testProtoOrder(testData.order.proto, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'byteOrder':
            if(testData.order.old.length > 0) {
                await testByteOrder(testData.order.old, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'request':
            if(testData.request.length > 0) {
                await testRequest(testData.request, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'custom':
            if(testData.tx.proto.length > 0) {
                await testCustomData(testData.customeData, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
        case 'message':
            if(testData.tx.proto.length > 0) {
                await testMessage(testData.message, userData, true);
            } else {
                autoTestEl.append(" No data for testing\n");
            }
            break;
    }
    statusEl.setAttribute('loading', 'false');
    enableButtons();
    autoTestEl.append(" End Test");
}

async function testProtoTxs(txs, userData, one= false) {
    autoTestEl.append(" Prototype transactions\n\n");
    for (const tx of txs) {
        let out = " Tx Type: " + tx.dataType +
            "\n Tx Version: " + tx.dataVersion +
            "\n Tx Data: " + tx.dataBuffer +
            "\n Tx amount Precision: " + (tx.amountPrecision ?? 8) +
            "\n Tx amount Precision 2: " + (tx.amount2Precision ?? 0) +
            "\n Tx fee Precision: " + (tx.feePrecision ?? 8) +
            "\n Tx json: \n" + JSON.stringify(tx.jsonView, undefined, 4);
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(tx.dataBuffer.split(',')));
            let sign = await appData.ledger().signTransaction(userData.id, {
                dataType: tx.dataType,
                dataVersion: tx.dataVersion,
                dataBuffer: dataBuf,
                amountPrecision: tx.amountPrecision ?? null,
                amount2Precision: tx.amount2Precision ?? null,
                feePrecision: tx.feePrecision ?? null,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testOldTxs(txs, userData, one= false) {
    autoTestEl.append(" Byte transactions\n\n");
    for (const tx of txs) {
        let out = " Tx Type: " + tx.dataType +
            "\n Tx Version: " + tx.dataVersion +
            "\n Tx Data: " + tx.dataBuffer +
            "\n Tx amount Precision: " +(tx.amountPrecision ?? 8) +
            "\n Tx fee Precision: " + (tx.feePrecision ?? 8) +
            "\n Tx json: \n" + JSON.stringify(tx.jsonView, undefined, 4);
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(tx.dataBuffer.split(',')));
            let sign = await appData.ledger().signTransaction(userData.id, {
                dataType: tx.dataType,
                dataVersion: tx.dataVersion,
                dataBuffer: dataBuf,
                amountPrecision: tx.amountPrecision ?? null,
                amount2Precision: tx.amount2Precision ?? null,
                feePrecision: tx.feePrecision ?? null,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testProtoOrder(orders, userData, one= false) {
    autoTestEl.append(" Prototype Orders\n\n");
    for (const order of orders) {
        let out = " Order Version: " + order.dataVersion +
            "\n Order Data: " + order.dataBuffer +
            "\n Order amount Precision: " +(order.amountPrecision ?? 8) +
            "\n Order fee Precision: " + (order.feePrecision ?? 8) +
            // "\n Tx json: \n" + JSON.stringify(tx.jsonView, undefined, 4);
            '';
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(order.dataBuffer.split(',')));
            let sign = await appData.ledger().signOrder(userData.id, {
                dataVersion: order.dataVersion,
                dataBuffer: dataBuf,
                amountPrecision: order.amountPrecision ?? null,
                amount2Precision: order.amount2Precision ?? null,
                feePrecision: order.feePrecision ?? null,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testByteOrder(orders, userData, one= false) {
    autoTestEl.append(" Byte Orders\n\n");
    for (const order of orders) {
        let out = " Order Version: " + order.dataVersion +
            "\n Order Data: " + order.dataBuffer +
            "\n Order amount Precision: " +(order.amountPrecision ?? 8) +
            "\n Order fee Precision: " + (order.feePrecision ?? 8) +
            // "\n Tx json: \n" + JSON.stringify(tx && tx.jsonView, undefined, 4);
            '';
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(order.dataBuffer.split(',')));
            let sign = await appData.ledger().signOrder(userData.id, {
                dataVersion: order.dataVersion,
                dataBuffer: dataBuf,
                amountPrecision: order.amountPrecision ?? null,
                amount2Precision: order.amount2Precision ?? null,
                feePrecision: order.feePrecision ?? null,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testRequest(requests, userData, one= false) {
    autoTestEl.append(" Requests\n\n");
    for (const request of requests) {
        let out = "\n Request Data: " + request.dataBuffer;
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(request.dataBuffer.split(',')));
            let sign = await appData.ledger().signRequest(userData.id, {
                dataBuffer: dataBuf,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testCustomData(items, userData, one= false) {
    autoTestEl.append(" Custom data\n\n");
    for (const data of items) {
        let out = "\n Custom Data: " + data.dataBuffer;
        autoTestEl.append(out);
        try {
            let dataBuf = new Buffer(new Buffer(data.dataBuffer.split(',')));
            let sign = await appData.ledger().signSomeData(userData.id, {
                dataBuffer: dataBuf,
            });
            out = "\n Signature: " + sign;
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

async function testMessage(messages, userData, one= false) {
    autoTestEl.append(" Messages\n\n");
    for (const message of messages) {
        let out = "\n Message: " + message;
        autoTestEl.append(out);
        try {
            let sign = await appData.ledger().signMessage(userData.id, message);
            out = "\n Signature: " + sign;
            let dataBuf = new Buffer(message, 'ascii');
            if(verifySignature(userData.publicKey, dataBuf, sign)) {
                out += "\n PASS";
            } else {
                out += "\n NOT PASS: Invalid signature";
            }

            out += "\n-------------------------------\n\n";
        } catch (e) {
            out = "\n NOT PASS: " + e.message;
            out += "\n-------------------------------\n\n";
        }
        autoTestEl.append(out);
        if(one === true) {
            break;
        }
    }
}

function getNextUsers(data) {
    if (nextUsersEl.getAttribute('disable') === 'true') {
        return null;
    }

    nextUsersEl.setAttribute('disable', 'true');
    statusEl.setAttribute('loading', 'true');
    statusEl.setAttribute('error', 'false');
    appData.ledger().getPaginationUsersData(appData.users.length, appData.users.length + 5).then(
        (users) => {
            appData.users = [...appData.users, ...users];
            drawUsers();
            statusEl.setAttribute('loading', 'false');
            nextUsersEl.setAttribute('disable', 'false');
        },
        () => {
            statusEl.setAttribute('loading', 'false');
            statusEl.setAttribute('error', 'true');
            nextUsersEl.setAttribute('disable', 'false');
        }
    );
}

function drawUsers() {
    let htmlData = '';
    appData.users.forEach((user) => {
        htmlData += `
        <p class="user-item" user-id="${user.id}">
            <span class="user-title">Id:      </span><code class="user-data id">${user.id}</code>
            <span class="user-title">Path:    </span><code class="user-data path">${user.path}</code>
            <span class="user-title">Address: </span><code class="user-data address">${user.address}</code> 
            <span class="user-title">Pub key: </span><code class="user-data key">${user.publicKey}</code>
        </p>
`;
    });
    usersListEl.innerHTML = htmlData;
    selectUser();
}

function _selectUser(event) {
    const target = event.target.closest('.user-item');
    appData.selectedUser = target.getAttribute("user-id");
    selectUser();
}

function selectUser() {
    const usersEls = document.querySelectorAll('.user-item');
    let selected = false;
    for (const el of usersEls) {
        const isSelected = appData.selectedUser == el.getAttribute("user-id");
        el.setAttribute('selected-user', String(isSelected));
        selected = selected || isSelected;
    }

    if (selected) {
        enableButtons();
    } else {
        appData.selectedUser = null;
        disableButtons();
    }

}

function destroyTestData() {
    autoTestEl.innerHTML = '';
}


function enableButtons() {
    for (const [key, el] of Object.entries(buttons)) {
        el.removeAttribute('disabled');
    }
}

function disableButtons() {
    for (const [key, el] of Object.entries(buttons)) {
        el.setAttribute('disabled', 'true');
    }
}

// function onChangeData() {
//     const dataBuffer = new Buffer(new Buffer(this.value.split(',')));
//     appData.signData = dataBuffer;
//     appData.outData = null;

//     const elOut: HTMLInputElement = document.querySelector('.data-out');
//     elOut.value = '';
// }

function toggleError(isError) {
    if (isError) {
        errorEl.classList.remove('hide');
    } else {
        errorEl.classList.add('hide');
    }
}

function showError() {
    const error = appData.ledger().getLastError();

    toggleError(error);

    const errorText = (error ? JSON.stringify(appData.ledger().getLastError(), (k,v) => v ,4) : '');
    const textEl =  document.querySelector('.error-text');
    if (textEl.innerHTML !== errorText ) {
        textEl.innerHTML = errorText;
    }

    toggleError(false);
}

function _toggleShowError() {
    const errorTextEl = document.querySelector('.error-text');
    const isHidden = errorTextEl.getAttribute('hide');

    toggleError(isHidden === 'true');
}

function origTx(txView) {
    let orig = { ...txView };

    // // todo hack
    // delete orig.id;
    // delete orig.proofs;

    return orig;
}

disableButtons();
appData.loadTestData();

}
