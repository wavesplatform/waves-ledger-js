import { Waves } from './Waves';
import { default as TransportU2F} from '@ledgerhq/hw-transport-u2f';

const ADDRES_PREFIX = "44'/5741564'/0'/0'/";

export class WavesLedger {

    constructor(debug = false) {
        this._wavesLibPromise = null;
        this._initTransportPromise = null;
        this._addressHashByAddress = {};
        this._addressHashById = {};
        this._debug = debug;
        this._error = null;
        this.ready = null;
        this.tryConnect();
    }

    async tryConnect() {
        const disconnectPromise = this.disconnect();
        this._initU2FTransport();
        this._setDebugMode();
        this._initWavesLib();
        await disconnectPromise;
        await Promise.all([this._initTransportPromise,  this._wavesLibPromise]);
    }

    async disconnect() {
        const transportpromise = this._initTransportPromise;
        this._initTransportPromise = null;
        this._wavesLibPromise = null;
        if (transportpromise) {
            try {
                const transport = await transportpromise;
                transport.close();
            } catch (e) {
            }
        }
    }

    async getUserDataById(id) {

        if (!this._addressHashById[id]) {
            try {
                const waves = await this._wavesLibPromise;
                const path = this.getPathById(id);
                const userData = await waves.getWalletPublicKey(path, false);
                this._addressHashByAddress[userData.wavesAddress] = {
                    ...userData, id, path
                };
                this._addressHashById[id] = this._addressHashByAddress[userData.wavesAddress];
            } catch (e) {
                this._error = e;
                throw e;
            }
        }

        return this._addressHashById[id];
    }

    async getPaginationUsersData(from, limit) {
        const usersData = [];

        try {
            for (let id = from; id <= from + limit; id++) {
                const userData = await this.getUserDataById(id);
                usersData.push(userData);
            }
        } catch (e) {
            this._error = e;
            throw e
        }

        return usersData;
    }

    async signTransaction (userId, asset, txData) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(txData);
        try {
            const waves = await this._wavesLibPromise;
            return await waves.signTransaction(path, asset.precision, msgData);

        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    async signSomeData(userId, dataBuffer) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(dataBuffer);
        try {
            const waves = await this._wavesLibPromise;
            return await waves.signSomeData(path, msgData);

        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    async signRequest(userId, dataBuffer) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(dataBuffer);
        try {
            const waves = await this._wavesLibPromise;
            return await waves.signRequest(path, msgData);

        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    async signMessage(userId, message) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(message, 'ascii');
        try {
            const waves = await this._wavesLibPromise;
            return await waves.signMessage(path, msgData);

        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    getLastError() {
        return this._error;
    }

    async probeDevice() {
        if (!this.ready) {
            this.tryConnect();
        }

        this._error = null;

        try {
            await this.getUserDataById(1);
        } catch (e) {
            this._error = e;
            return false;
        }
        return true;
    }

    getPathById(id) {
        return `${ADDRES_PREFIX}${id}'`;
    }

    _setDebugMode() {
        this._initTransportPromise.then((transport) => {
            transport.setDebugMode(this._debug);
        });
    }

    _initU2FTransport() {
        this.ready = false;
        this._initTransportPromise = TransportU2F.create();
        return this._initTransportPromise;
    }

    _initWavesLib() {
        this._wavesLibPromise = this._initTransportPromise.then((transport) => {
            this.ready = true;
            return new Waves(transport);
        });
        return this._wavesLibPromise;
    }
}
