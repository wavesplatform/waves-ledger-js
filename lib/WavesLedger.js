"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Waves_1 = require("./Waves");
const hw_transport_u2f_1 = require("@ledgerhq/hw-transport-u2f");
const ADDRES_PREFIX = "44'/5741564'/0'/0'/";
class WavesLedger {
    constructor(debug = false) {
        this._wavesLibPromise = null;
        this._initTransportPromise = null;
        this._debug = debug;
        this._error = null;
        this.ready = null;
        this.tryConnect();
    }
    tryConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const disconnectPromise = this.disconnect();
            this._initU2FTransport();
            this._setDebugMode();
            this._initWavesLib();
            yield disconnectPromise;
            yield Promise.all([this._initTransportPromise, this._wavesLibPromise]);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const transportpromise = this._initTransportPromise;
            this._initTransportPromise = null;
            this._wavesLibPromise = null;
            if (transportpromise) {
                try {
                    const transport = yield transportpromise;
                    transport.close();
                }
                catch (e) {
                }
            }
        });
    }
    getUserDataById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const waves = yield this._wavesLibPromise;
                const path = this.getPathById(id);
                const userData = yield waves.getWalletPublicKey(path, false);
                return Object.assign({}, userData, { id, path });
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    getPaginationUsersData(from, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersData = [];
            try {
                for (let id = from; id <= from + limit; id++) {
                    const userData = yield this.getUserDataById(id);
                    usersData.push(userData);
                }
            }
            catch (e) {
                this._error = e;
                throw e;
            }
            return usersData;
        });
    }
    signTransaction(userId, asset, txData) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPathById(userId);
            const msgData = new Buffer(txData);
            try {
                const waves = yield this._wavesLibPromise;
                return yield waves.signTransaction(path, asset.precision, msgData);
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    signOrder(userId, asset, txData) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPathById(userId);
            const msgData = new Buffer(txData);
            try {
                const waves = yield this._wavesLibPromise;
                return yield waves.signOrder(path, asset.precision, msgData);
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    signSomeData(userId, dataBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPathById(userId);
            const msgData = new Buffer(dataBuffer);
            try {
                const waves = yield this._wavesLibPromise;
                return yield waves.signSomeData(path, msgData);
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    signRequest(userId, dataBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPathById(userId);
            const msgData = new Buffer(dataBuffer);
            try {
                const waves = yield this._wavesLibPromise;
                return yield waves.signRequest(path, msgData);
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    signMessage(userId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.getPathById(userId);
            const msgData = new Buffer(message, 'ascii');
            try {
                const waves = yield this._wavesLibPromise;
                return yield waves.signMessage(path, msgData);
            }
            catch (e) {
                this._error = e;
                throw e;
            }
        });
    }
    getLastError() {
        return this._error;
    }
    probeDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                this.tryConnect();
            }
            this._error = null;
            try {
                yield this.getUserDataById(1);
            }
            catch (e) {
                this._error = e;
                return false;
            }
            return true;
        });
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
        this._initTransportPromise = hw_transport_u2f_1.default.create();
        return this._initTransportPromise;
    }
    _initWavesLib() {
        this._wavesLibPromise = this._initTransportPromise.then((transport) => {
            this.ready = true;
            return new Waves_1.Waves(transport);
        });
        return this._wavesLibPromise;
    }
}
exports.WavesLedger = WavesLedger;
//# sourceMappingURL=WavesLedger.js.map