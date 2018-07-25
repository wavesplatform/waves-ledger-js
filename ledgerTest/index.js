import { WavesLedger } from '../src/WavesLedger';

const statusEl = document.querySelector('.device-status');
const usersListEl = document.querySelector('.users-list');
const nextUsersEl = document.querySelector('.users-list-next');
const sendUserFormEl = document.querySelector('.send-form');

const signTransactionEl = document.querySelector('.sign-transaction');
const signTransferEl = document.querySelector('.sign-transfer');
const signMessageEl = document.querySelector('.sign-message');
const signCustomEl = document.querySelector('.sign-custom');
const errorEl = document.querySelector('.error');
const errorButton = document.querySelector('.error button');

const filterEl = document.querySelector('.hide-selected');

const ledger = new WavesLedger(true);
const appData = { ledger, users: []};
const buttons = {
    transaction: signTransactionEl,
    transfer: signTransferEl,
    message: signMessageEl,
    custom: signCustomEl,
};


nextUsersEl.addEventListener('click', getNextUsers);
usersListEl.addEventListener('click', _selectUser);
signCustomEl.addEventListener('click', _signCustom);
signTransactionEl.addEventListener('click', _signTransaction);
signTransferEl.addEventListener('click', _signRequest);
errorButton.addEventListener('click', _toggleShowError);

filterEl.addEventListener('change', () => {
    usersListEl.setAttribute('show-selected', !!filterEl.checked);
});

function tryConnect() {
    statusEl.setAttribute('loading', true);
    nextUsersEl.setAttribute('disable', true);
    ledger.probeDevice().then(
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

function getNextUsers(data) {
    if (nextUsersEl.getAttribute('disable') === 'true') {
        return null;
    }

    nextUsersEl.setAttribute('disable', true);
    statusEl.setAttribute('loading', true);
    statusEl.setAttribute('error', false);
    appData.ledger.getPaginationUsersData(appData.users.length, appData.users.length + 5).then(
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

    appData.ledger.signSomeData(appData.selectedUser, appData.signData).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signCustomEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            const outEl = document.querySelector('.data-out');
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signCustomEl.setAttribute('disable', false);
            outEl.value = '';
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

    appData.ledger.signTransaction(appData.selectedUser, {precision: 0}, appData.signData).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            const outEl = document.querySelector('.data-out');
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signTransactionEl.setAttribute('disable', false);
            outEl.value = '';
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

    appData.ledger.signRequest(appData.selectedUser, appData.signData).then(
        (data) => {
            statusEl.setAttribute('loading', false);
            signTransactionEl.setAttribute('disable', false);
            const outEl = document.querySelector('.data-out');
            outEl.value = data;
            appData.outData = data;
        },
        (err) => {
            const outEl = document.querySelector('.data-out');
            statusEl.setAttribute('loading', false);
            statusEl.setAttribute('error', true);
            signTransactionEl.setAttribute('disable', false);
            outEl.value = '';
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
            <span class="user-title">Address: </span><code class="user-data address">${user.wavesAddress}</code> 
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
        drawForm();
    } else {
        appData.selectedUser = null;
        destroyForm();
    }

}

function destroyForm() {
    sendUserFormEl.innerHTML = '';
}

function drawForm() {
    const user = appData.users.find((user) => user.id == appData.selectedUser);

    let formHtml = `
        <div class="form-title">Sign data for <code>${user.path}</code></div>
        <span class="data-wrapper">
            <label>Data in</label>
            <textarea class="data"></textarea>
        </span>
        <span class="data-wrapper">
            <label>Data out</label>
            <textarea class="data-out"></textarea>
        </span>
    `;

    sendUserFormEl.innerHTML = formHtml;
    const inData = document.querySelector('.data');
    inData.addEventListener('change', onChangeData);

}

// function enableSignByType(type) {
//      for (const [key, el] of Object.entries(buttons)) {
//          el.setAttribute('disable', key !== type);
//      }
// }

function enableSignByType() {
    for (const [key, el] of Object.entries(buttons)) {
        el.setAttribute('disable', false);
    }
}

function onChangeData() {
    const dataBuffer = new Buffer(new Buffer(this.value.split(',')));
    appData.signData = dataBuffer;
    appData.outData = null;
    document.querySelector('.data-out').value = '';
}

function showError() {
    const error = appData.ledger.getLastError();
    errorEl.setAttribute('hide', !error);
    const errorText = (error ? JSON.stringify(appData.ledger.getLastError(), 4 ,4, 4) : '');
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


enableSignByType();
tryConnect();
