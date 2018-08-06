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
const waves_signature_generator_1 = require("@waves/waves-signature-generator");
const WAVES_CONFIG = {
    STATUS: {
        SW_OK: 0x9000,
        SW_USER_CANCELLED: 0x9100,
        SW_CONDITIONS_NOT_SATISFIED: 0x6985,
        SW_BUFFER_OVERFLOW: 0x6990,
        SW_INCORRECT_P1_P2: 0x6A86,
        SW_INS_NOT_SUPPORTED: 0x6D00,
        SW_CLA_NOT_SUPPORTED: 0x6E00,
        SW_SECURITY_STATUS_NOT_SATISFIED: 0x6982
    },
    SECRET: 'WAVES',
    PUBLIC_KEY_LENGTH: 32,
    ADDRESS_LENGTH: 35,
    STATUS_LENGTH: 2,
    SIGNED_CODES: {
        ORDER: 0xFC,
        SOME_DATA: 0xFD,
        REQUEST: 0xFE,
        MESSAGE: 0xFF
    },
    MAX_SIZE: 128,
    WAVES_PRECISION: 8,
};
class Waves {
    constructor(transport, networkCode = 87) {
        this.transport = transport;
        this.networkCode = networkCode;
        this.decorateClassByTransport();
    }
    decorateClassByTransport() {
        this.transport.decorateAppAPIMethods(this, [
            'getWalletPublicKey',
            'signTransaction',
            'signMessage',
            'signSomeData',
            'signRequest',
            'signOrder'
        ], WAVES_CONFIG.SECRET);
    }
    getWalletPublicKey(path, verify = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = Waves.splitPath(path);
            const p1 = verify ? 0x80 : 0x00;
            const response = yield this.transport.send(0x80, 0x04, p1, this.networkCode, buffer);
            const publicKey = waves_signature_generator_1.libs.base58.encode(response.slice(0, WAVES_CONFIG.PUBLIC_KEY_LENGTH));
            const address = response
                .slice(WAVES_CONFIG.PUBLIC_KEY_LENGTH, WAVES_CONFIG.PUBLIC_KEY_LENGTH + WAVES_CONFIG.ADDRESS_LENGTH)
                .toString("ascii");
            const statusCode = response
                .slice(-WAVES_CONFIG.STATUS_LENGTH)
                .toString("hex");
            return { publicKey, address, statusCode };
        });
    }
    signTransaction(path, amountPrecission, txData) {
        const dataForSign = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                amountPrecission,
                WAVES_CONFIG.WAVES_PRECISION,
            ]),
            txData
        ]);
        return this._signData(dataForSign);
    }
    signOrder(path, amountPrecission, txData) {
        const dataForSign = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                amountPrecission,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.ORDER
            ]),
            txData
        ]);
        return this._signData(dataForSign);
    }
    signSomeData(path, msgBuffer) {
        const dataForSign = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.SOME_DATA
            ]),
            msgBuffer
        ]);
        return this._signData(dataForSign);
    }
    signRequest(path, msgBuffer) {
        const dataForSign = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.REQUEST
            ]),
            msgBuffer
        ]);
        return this._signData(dataForSign);
    }
    signMessage(path, msgBuffer) {
        const dataForSign = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.MESSAGE
            ]),
            msgBuffer
        ]);
        return this._signData(dataForSign);
    }
    _signData(dataBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxChankLength = WAVES_CONFIG.MAX_SIZE - 5;
            const dataLength = dataBuffer.length;
            let sendBytes = 0;
            let result;
            while (dataLength > sendBytes) {
                const chankLength = Math.min(dataLength - sendBytes, maxChankLength);
                const isLastByte = (dataLength - sendBytes > maxChankLength) ? 0x00 : 0x80;
                const chainId = isLastByte ? this.networkCode : 0x00;
                const txChank = dataBuffer.slice(sendBytes, chankLength + sendBytes);
                sendBytes += chankLength;
                result = yield this.transport.send(0x80, 0x02, isLastByte, 0x00, txChank);
                const isError = Waves.checkError(result.slice(-2));
                if (isError) {
                    throw isError;
                }
            }
            return waves_signature_generator_1.libs.base58.encode(result.slice(0, -2));
        });
    }
    static checkError(data) {
        const statusCode = data[0] * 16 * 16 + data[1];
        if (statusCode === WAVES_CONFIG.STATUS.SW_OK) {
            return null;
        }
        return { error: 'Wrong data', status: statusCode };
    }
    static splitPath(path) {
        const result = [];
        path.split("/").forEach(element => {
            let number = parseInt(element, 10);
            if (isNaN(number)) {
                return;
            }
            if (element.length > 1 && element[element.length - 1] === "'") {
                number += 0x80000000;
            }
            result.push(number);
        });
        const buffer = new Buffer(result.length * 4);
        result.forEach((element, index) => {
            buffer.writeUInt32BE(element, 4 * index);
        });
        return buffer;
    }
}
exports.Waves = Waves;
//# sourceMappingURL=Waves.js.map