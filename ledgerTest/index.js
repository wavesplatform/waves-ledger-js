const { WavesLedger } = require('../lib/WavesLedger');
import { verifySignature } from '@waves/ts-lib-crypto'
import * as testData from '../ledgerTest/testdata.json';

import { base58Encode } from '../lib/utils';

const statusEl = document.querySelector('.device-status');
const usersListEl = document.querySelector('.users-list');
const nextUsersEl = document.querySelector('.users-list-next');

const autoTestEl = document.querySelector('.autotest-data');

const initDeviceBtn = document.querySelector('.device-init');
const tryConnectBtn = document.querySelector('.device-connect');
const protoTxTestBut = document.querySelector('.proto-tx');
const byteTxTestBut = document.querySelector('.byte-tx');
const protoOrderTestBut = document.querySelector('.proto-order');
const byteOrderTestBut = document.querySelector('.byte-order');
const requestTestBut = document.querySelector('.request');
const customDataTestBut = document.querySelector('.custom-data');
const messageTestBut = document.querySelector('.message');

const errorEl = document.querySelector('.error');
const errorButton = document.querySelector('.error button');
const autoTestButton = document.querySelector('.autotest');

const filterEl = document.querySelector('.hide-selected');

// const Transport = require('../node_modules/@ledgerhq/hw-transport-u2f/lib/TransportU2F').default;
const Transport = require('../node_modules/@ledgerhq/hw-transport-webusb/lib/TransportWebUSB').default;

const appData = {
    _ledger: null,
    ledger: function() { return this._ledger },
    users: []
};

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
tryConnectBtn.addEventListener('click', tryConnect);
autoTestButton.addEventListener('click', autoTest);
nextUsersEl.addEventListener('click', getNextUsers);
usersListEl.addEventListener('click', _selectUser);
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

filterEl.addEventListener('change', () => {
    usersListEl.setAttribute('show-selected', !!filterEl.checked);
});

function initDevice() {
    const ledger = new WavesLedger({
        debug: true,
        openTimeout: 3000,
        listenTimeout: 30000,
        exchangeTimeout: 30000,
        networkCode: 82, //stagenet
        transport: Transport
    });

    appData._ledger = ledger;
}

function tryConnect() {
    statusEl.setAttribute('loading', true);
    nextUsersEl.setAttribute('disable', true);
    appData.ledger().probeDevice().then(
        (status) => {
            appData.status = status ? 'on' : 'off';
            statusEl.setAttribute('status', appData.status);
            if (!status) {
                showError();
                nextUsersEl.setAttribute('disable', true);
            } else {
                nextUsersEl.setAttribute('disable', false);
            }
            statusEl.setAttribute('loading', false);
        }
    );
}

async function autoTest() {
    let userData = appData.users[appData.selectedUser];
    statusEl.setAttribute('loading', true);
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

    statusEl.setAttribute('loading', false);
    enableButtons();
}

async function testOne(type) {
    let userData = appData.users[appData.selectedUser];
    destroyTestData();
    disableButtons();
    autoTestEl.append(" Start Test\n");
    autoTestEl.append("-------------------------------\n\n");
    statusEl.setAttribute('loading', true);
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
    statusEl.setAttribute('loading', false);
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
            "\n Tx json: \n" + JSON.stringify(tx.jsonView, undefined, 4);
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
            "\n Tx json: \n" + JSON.stringify(tx.jsonView, undefined, 4);
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

    nextUsersEl.setAttribute('disable', true);
    statusEl.setAttribute('loading', true);
    statusEl.setAttribute('error', false);
    appData.ledger().getPaginationUsersData(appData.users.length, appData.users.length + 5).then(
        (users) => {
            appData.users = [...appData.users, ...users];
            drawUsers();
            statusEl.setAttribute('loading', false);
            nextUsersEl.setAttribute('disable', false);
        },
        () => {
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            nextUsersEl.setAttribute('disable', false);
        }
    );
}

function _signCustom() {
    if (signCustomEl.getAttribute('disable') === 'true') {
        return null;
    }

    signCustomEl.setAttribute('disable', true);
    statusEl.setAttribute('loading', true);
    statusEl.setAttribute('error', false);

    appData.ledger().signSomeData(appData.selectedUser, {dataBuffer: appData.signData}).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signCustomEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            console.log(err);
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signCustomEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            if (outEl) {
                outEl.value = '';
            }
            appData.outData = null;
        }
    );
}

function _signTransaction() {
    if (signCustomEl.getAttribute('disable') === 'true') {
        return null;
    }
    signTransactionEl.setAttribute('disable', true);
    statusEl.setAttribute('loading', true);
    statusEl.setAttribute('error', false);
    appData.ledger().signTransaction(appData.selectedUser, {
        dataType: 4,
        dataVersion: 3,
        dataBuffer: appData.signData
    }).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            console.log(err);
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            if (outEl) {
                outEl.value = '';
            }
            appData.outData = null;
        }
    );
}

function _signRequest() {
    if (signCustomEl.getAttribute('disable') === 'true') {
        return null;
    }

    signTransactionEl.setAttribute('disable', true);
    statusEl.setAttribute('loading', true);
    statusEl.setAttribute('error', false);

    appData.ledger().signRequest(appData.selectedUser, {dataBuffer: appData.signData}).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            console.log(err);
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            if (outEl) {
                outEl.value = '';
            }
            appData.outData = null;
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
        el.setAttribute('selected-user', isSelected);
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
        el.setAttribute('disabled', true);
    }
}

function onChangeData() {
    const dataBuffer = new Buffer(new Buffer(this.value.split(',')));
    appData.signData = dataBuffer;
    appData.outData = null;
    document.querySelector('.data-out').value = '';
}

function showError() {
    const error = appData.ledger().getLastError();
    errorEl.setAttribute('hide', !error);
    const errorText = (error ? JSON.stringify(appData.ledger().getLastError(), 4 ,4, 4) : '');
    const textEl =  document.querySelector('.error-text');
    if (textEl.innerHTML !== errorText ) {
        textEl.innerHTML = errorText;
    }

    textEl.setAttribute('hide', false);
}

function _toggleShowError() {
    const errorTextEl = document.querySelector('.error-text');
    const isHidden = errorTextEl.getAttribute('hide');
    errorTextEl.setAttribute('hide', isHidden === 'true' ? false : true);
}


disableButtons();
// tryConnect();
