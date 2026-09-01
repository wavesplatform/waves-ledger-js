/// <reference path="../interface.d.ts"/>

import { listen } from '@ledgerhq/logs';
import { Waves, ISignTxData, ISignOrderData, ISignData } from './Waves';
import { AutoTransport, createLedgerTransport } from './transport';
import { IWavesLedgerConfig, IUser } from './WavesLedger.interface';

declare const Buffer: any;

const ADDRESS_PREFIX = '44\'/5741564\'/0\'/0\'/';

export class WavesLedgerSync {
    public ready: boolean;
    private _wavesLibPromise: Promise<Waves> | null;
    private _initTransportPromise: Promise<any> | null;
    private _debug: boolean;
    private _openTimeout: number | undefined;
    private _listenTimeout: number | undefined;
    private _exchangeTimeout: number | undefined;
    private _networkCode: number;
    private _signProtocol: IWavesLedgerConfig['signProtocol'];
    private _preferWebHID: boolean;
    private _error: any;
    private _transport: IWavesLedgerConfig['transport'];

    constructor(options: IWavesLedgerConfig = {}) {
        this.ready = false;
        this._networkCode = options.networkCode == null ? 87 : options.networkCode;
        this._wavesLibPromise = null;
        this._initTransportPromise = null;
        this._debug = options.debug == null ? false : options.debug;
        this._openTimeout = options.openTimeout;
        this._listenTimeout = options.listenTimeout;
        this._exchangeTimeout = options.exchangeTimeout == null ? 300000 : options.exchangeTimeout;
        this._signProtocol = options.signProtocol == null ? 'auto' : options.signProtocol;
        this._preferWebHID = options.preferWebHID == null ? true : options.preferWebHID;
        this._error = null;
        this._transport = options.transport || AutoTransport;
    }

    async tryConnect(): Promise<void> {
        try {
            const disconnectPromise = this.disconnect();
            this._initTransport();
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
        this.ready = false;
        if (transportPromise) {
            try {
                const transport = await transportPromise;
                transport.close();
            } catch (e) {
            }
        }
    }

    async getTransport(): Promise<Waves> {
        try {
            return await this._wavesLibPromise as Waves;
        } catch (e) {
            await this.tryConnect();
            return await this._wavesLibPromise as Waves;
        }
    }

    async getUserDataById(id: number): Promise<IUser> {
        try {
            const waves = await this.getTransport();
            const path = this.getPathById(id);
            const userData = await waves.getWalletPublicKey(path, false);
            return { ...userData, id, path };
        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    async getVersion(): Promise<Array<number>> {
        try {
            const waves = await this.getTransport();
            return await waves.getVersion();
        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    async getPaginationUsersData(from: number, to: number): Promise<Array<IUser>> {
        const usersData: IUser[] = [];
        try {
            for (let id = from; id <= to; id++) {
                usersData.push(await this.getUserDataById(id));
            }
        } catch (e) {
            this._error = e;
            throw e;
        }
        return usersData;
    }

    async signTransaction(userId: number, sData: ISignTxData) {
        const path = this.getPathById(userId);
        sData.dataBuffer = new Buffer(sData.dataBuffer);
        return this._sign(path, (waves) => waves.signTransaction(path, sData));
    }

    async signOrder(userId: number, sData: ISignOrderData) {
        const path = this.getPathById(userId);
        sData.dataBuffer = new Buffer(sData.dataBuffer);
        return this._sign(path, (waves) => waves.signOrder(path, sData));
    }

    async signSomeData(userId: number, sData: ISignData) {
        const path = this.getPathById(userId);
        sData.dataBuffer = new Buffer(sData.dataBuffer);
        return this._sign(path, (waves) => waves.signSomeData(path, sData));
    }

    async signRequest(userId: number, sData: ISignData) {
        const path = this.getPathById(userId);
        sData.dataBuffer = new Buffer(sData.dataBuffer);
        return this._sign(path, (waves) => waves.signRequest(path, sData));
    }

    async signMessage(userId: number, message: string) {
        const path = this.getPathById(userId);
        const sData: ISignData = { dataBuffer: new Buffer(message, 'ascii') };
        return this._sign(path, (waves) => waves.signMessage(path, sData));
    }

    getLastError() {
        return this._error;
    }

    async probeDevice(): Promise<boolean> {
        if (!this.ready) {
            await this.tryConnect();
        }

        this._error = null;

        try {
            await this.getUserDataById(0);
            return true;
        } catch (e) {
            this._error = e;
            return false;
        }
    }

    getPathById(id: number) {
        return `${ADDRESS_PREFIX}${id}'`;
    }

    private async _sign(path: string, fn: (waves: Waves) => Promise<string>) {
        try {
            const waves = await this.getTransport();
            return await fn(waves);
        } catch (e) {
            this._error = e;
            throw e;
        }
    }

    _setSettings() {
        (this._initTransportPromise as Promise<any>).then((transport) => {
            if (this._debug) {
                listen((log: any) => console.log('[ledger]', log));
            }
            if (this._exchangeTimeout) {
                transport.setExchangeTimeout(this._exchangeTimeout);
            }
        }).catch((e) => console.warn('can\'t init ledger', e));
    }

    _initTransport() {
        this.ready = false;
        if (this._transport === AutoTransport) {
            this._initTransportPromise = createLedgerTransport({
                openTimeout: this._openTimeout,
                listenTimeout: this._listenTimeout,
                preferWebHID: this._preferWebHID,
            });
        } else {
            this._initTransportPromise = this._transport!.create(this._openTimeout, this._listenTimeout);
        }
        (this._initTransportPromise as Promise<any>).catch((e) => console.warn('Can\'t init transport', e));
        return this._initTransportPromise;
    }

    _initWavesLib() {
        this._wavesLibPromise = (this._initTransportPromise as Promise<any>).then((transport: any) => {
            this.ready = true;
            return new Waves(transport, this._networkCode, this._signProtocol);
        });
        return this._wavesLibPromise;
    }
}

export default WavesLedgerSync;

export function pathForAccount(index: number): string {
    return `44'/5741564'/0'/0'/${index}'`;
}
