/// <reference path="../interface.d.ts"/>


import '@babel/polyfill';
import { Waves, IUserData } from './Waves';
import { default as TransportU2F } from '@ledgerhq/hw-transport-u2f';

declare const Buffer: any;

const ADDRES_PREFIX = '44\'/5741564\'/0\'/0\'/';

export class WavesLedger {

    public ready: boolean;
    private _wavesLibPromise: Promise<Waves> | null;
    private _initTransportPromise: Promise<any> | null;
    private _debug: boolean;
    private _openTimeout: number | undefined;
    private _listenTimeout: number | undefined;
    private _exchangeTimeout: number | undefined;
    private _networkCode: number;
    private _error: any;
    private _transport: any;

    constructor(options: IWavesLedger) {
        this.ready = false;
        this._networkCode = options.networkCode == null ? 87 : options.networkCode;
        this._wavesLibPromise = null;
        this._initTransportPromise = null;
        this._debug = options.debug == null ? false : options.debug;
        this._openTimeout = options.openTimeout;
        this._listenTimeout = options.listenTimeout;
        this._exchangeTimeout = options.exchangeTimeout;
        this._error = null;
        this._transport = options.transport || TransportU2F;
        this.tryConnect().catch(
            (e) => console.warn('Ledger lib is not available', e)
        );
    }

    async tryConnect(): Promise<void> {
        try {
            const disconnectPromise = this.disconnect();
            this._initU2FTransport();
            this._setSettings();
            this._initWavesLib();
            await disconnectPromise;
            await Promise.all([this._initTransportPromise, this._wavesLibPromise]);
        } catch (e) {
            throw new Error(e);
        }
    }

    async disconnect(): Promise<void> {
        const transportPromise = this._initTransportPromise;
        this._initTransportPromise = null;
        this._wavesLibPromise = null;
        if (transportPromise) {
            try {
                const transport = await transportPromise;
                transport.close();
            } catch (e) {
            }
        }
    }

    async getTransport(): Promise<any> {
        try {
            return await this._wavesLibPromise;
        } catch (e) {
            await this.tryConnect();
            return await this._wavesLibPromise;
        }
    }

    async getUserDataById(id: number): Promise<IUser> {
        try {
            const waves = await this.getTransport();
            const path = this.getPathById(id);
            const userData = await waves.getWalletPublicKey(path, false);
            return {
                ...userData, id, path
            };
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async getVersion(): Promise<Array<number>> {
        try {
            const waves = await this.getTransport();
            return await waves.getVersion();

        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async getPaginationUsersData(from: number, limit: number): Promise<Array<IUser>> {
        const usersData = [];

        try {
            for (let id = from; id <= from + limit; id++) {
                const userData = await this.getUserDataById(id);
                usersData.push(userData);
            }
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }

        return usersData;
    }

    async signTransaction(userId: number, asset: { precision: number }, txData: Uint8Array, version = 2) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(txData);
        try {
            const waves = await this.getTransport();
            return await waves.signTransaction(path, asset.precision, msgData, version);
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async signOrder(userId: number, asset: { precision: number }, txData: Uint8Array) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(txData);
        try {
            const waves = await this.getTransport();
            return await waves.signOrder(path, asset.precision, msgData);
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async signSomeData(userId: number, dataBuffer: Uint8Array) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(dataBuffer);
        try {
            const waves = await this.getTransport();
            return await waves.signSomeData(path, msgData);
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async signRequest(userId: number, dataBuffer: Uint8Array) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(dataBuffer);
        try {
            const waves = await this.getTransport();
            return await waves.signRequest(path, msgData);
        } catch (e) {
            this.tryConnect();
            this._error = e;
            throw e;
        }
    }

    async signMessage(userId: number, message: string) {
        const path = this.getPathById(userId);
        const msgData = new Buffer(message, 'ascii');
        try {
            const waves = await this.getTransport();
            return await waves.signMessage(path, msgData);
        } catch (e) {
            this.tryConnect();
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

    getPathById(id: number) {
        return `${ADDRES_PREFIX}${id}'`;
    }

    _setSettings() {
        (this._initTransportPromise as Promise<any>).then((transport) => {
            transport.setDebugMode(this._debug);
            transport.setExchangeTimeout(this._exchangeTimeout);
        }).catch(e => console.warn('can\'t init ledger', e));
    }

    _initU2FTransport() {
        this.ready = false;
        this._initTransportPromise = this._transport.create(this._openTimeout, this._listenTimeout);
        (this._initTransportPromise as Promise<any>).catch((e) => console.warn('Can\'t init transport', e));
        return this._initTransportPromise;
    }

    _initWavesLib() {
        this._wavesLibPromise = (this._initTransportPromise as Promise<any>).then(
            (transport: any) => {
                this.ready = true;
                return new Waves(transport, this._networkCode);
            });
        return this._wavesLibPromise;
    }

}

export default WavesLedger;

interface IWavesLedger {
    debug?: boolean;
    openTimeout?: number;
    listenTimeout?: number;
    exchangeTimeout?: number;
    networkCode?: number,
    transport?: any;
}

interface IUser extends IUserData {
    id: number;
    path: string;
}
