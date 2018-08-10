import { Waves, IUserData } from './Waves';
import { default as TransportU2F } from '@ledgerhq/hw-transport-u2f';
declare const Buffer;

const ADDRES_PREFIX = "44'/5741564'/0'/0'/";

export class WavesLedger {

    public ready: boolean;
    private _wavesLibPromise: Promise<Waves>;
    private _initTransportPromise: Promise<TransportU2F>;
    private _debug: boolean;
    private _isNative: boolean;
    private _openTimeout: number;
    private _listenTimeout: number;
    private _networkCode: number;
    private _error: any;
    private _transport;

    constructor(options: IWavesLedger) {
        this.ready = null;
        this._networkCode = options.networkCode == null ? 87 : options.networkCode;
        this._wavesLibPromise = null;
        this._initTransportPromise = null;
        this._debug = options.debug;
        this._isNative = options.isNative;
        this._openTimeout = options.openTimeout;
        this._listenTimeout = options.listenTimeout;
        this._error = null;
        this._transport = options.transport || TransportU2F;
        this.tryConnect();
    }

    async tryConnect(): Promise<void> {
        const disconnectPromise = this.disconnect();
        this._initU2FTransport();
        this._setDebugMode();
        this._initWavesLib();
        await disconnectPromise;
        await Promise.all([this._initTransportPromise,  this._wavesLibPromise]);
    }

    async disconnect(): Promise<void> {
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

    async getUserDataById(id): Promise<IUser> {
        try {
            const waves = await this._wavesLibPromise;
            const path = this.getPathById(id);
            const userData = await waves.getWalletPublicKey(path, false);
            return {
                ...userData, id, path
            };
        } catch (e) {
            this._error = e;
            throw e;
        }
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

    async signOrder (userId, asset, txData) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(txData);
        try {
            const waves = await this._wavesLibPromise;
            return await waves.signOrder(path, asset.precision, msgData);
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
            await this.tryConnect();
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
        this._initTransportPromise =
            this._isNative ?
            null : // TransportNode.create(this._timeout) :
            this._transport.create(this._openTimeout, this._listenTimeout);
        return this._initTransportPromise;
    }

    _initWavesLib() {
        this._wavesLibPromise = this._initTransportPromise.then(
            (transport) => {
                this.ready = true;
                return new Waves(transport, this._networkCode);
            });
        return this._wavesLibPromise;
    }

}

interface IWavesLedger  {
    debug?: boolean;
    isNative?: boolean;
    openTimeout?: number;
    listenTimeout?: number;
    networkCode?: number,
    transport?
}

interface IUser extends IUserData {
    id: number;
    path: string;
}
