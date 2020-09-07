import { base58Encode } from './utils';

declare const Buffer: any;

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
    MAIN_NET_CODE: 87,
};

export class Waves {

    protected transport: any;
    protected networkCode: number;
    protected _version: Promise<Array<number>> | null = null;

    constructor(transport: any, networkCode = WAVES_CONFIG.MAIN_NET_CODE) {
        this.transport = transport;
        this.networkCode = networkCode;
        this.decorateClassByTransport();
    }

    decorateClassByTransport() {
        this.transport.decorateAppAPIMethods(
            this,
            [
                'getWalletPublicKey',
                '_signData',
                'getVersion',
            ],
            WAVES_CONFIG.SECRET
        );
    }

    protected static _toInt32Bytes(num: number): ArrayBuffer {
        const buf = new ArrayBuffer(4); // an Int32 takes 4 bytes
        const view = new DataView(buf);
        view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
        return new Uint8Array(buf);
    }

    async getWalletPublicKey(path: string, verify = false): Promise<IUserData> {
        const buffer = Waves.splitPath(path);
        const p1 = verify ? 0x80 : 0x00;
        const response = await this.transport.send(0x80, 0x04, p1, this.networkCode, buffer);
        const publicKey = base58Encode(response.slice(0, WAVES_CONFIG.PUBLIC_KEY_LENGTH));
        const address = response
            .slice(WAVES_CONFIG.PUBLIC_KEY_LENGTH, WAVES_CONFIG.PUBLIC_KEY_LENGTH + WAVES_CONFIG.ADDRESS_LENGTH)
            .toString('ascii');
        const statusCode = response
            .slice(-WAVES_CONFIG.STATUS_LENGTH)
            .toString('hex');
        return { publicKey, address, statusCode };
    }

    async signTransaction(path: string, sData: ISignTxData): Promise<string> {
        const dataForDevice = await this._fillDataForSign(path, sData);
        return await this._signData(dataForDevice);
    }

    async signOrder(path: string, sOData: ISignOrderData): Promise<string> {
        const sData = sOData as ISignTxData;
        sData.dataType = WAVES_CONFIG.SIGNED_CODES.ORDER
        const dataForDevice = await this._fillDataForSign(path, sData);
        return await this._signData(dataForDevice);
    }

    async signSomeData(path: string, sOData: ISignData): Promise<string> {
        const sData = sOData as ISignTxData;
        sData.dataType = WAVES_CONFIG.SIGNED_CODES.SOME_DATA
        sData.dataVersion = 0;
        sData.amountPrecision = 0;
        sData.feePrecision = 0;
        const dataForDevice = await this._fillDataForSign(path, sData);
        return await this._signData(dataForDevice);
    }

    async signRequest(path: string, sOData: ISignData): Promise<string> {
        const sData = sOData as ISignTxData;
        sData.dataType = WAVES_CONFIG.SIGNED_CODES.REQUEST
        sData.dataVersion = 0;
        sData.amountPrecision = 0;
        sData.feePrecision = 0;
        const dataForDevice = await this._fillDataForSign(path, sData);
        return await this._signData(dataForDevice);
    }

    async signMessage(path: string, sOData: ISignData): Promise<string> {
        const sData = sOData as ISignTxData;
        sData.dataType = WAVES_CONFIG.SIGNED_CODES.MESSAGE
        sData.dataVersion = 0;
        sData.amountPrecision = 0;
        sData.feePrecision = 0;
        const dataForDevice = await this._fillDataForSign(path, sData);
        return await this._signData(dataForDevice);
    }

    async getVersion(): Promise<Array<number>> {
        if (!this._version) {
            this._version = this.transport.send(0x80, 0x06, 0, 0);
        }

        try {
            const version: Array<number> = await this._version as Array<number>;
            const isError = Waves.checkError(version.slice(-2));

            if (isError) {
                throw isError;
            }

            return version.slice(0, -2);
        } catch (e) {
            this._version = null;
            throw e;
        }
    }

    protected async _fillDataForSign(path: string, sData: ISignTxData) {
        const appVersion = await this.getVersion();
        const amountPrecision = sData?.amountPrecision ?? WAVES_CONFIG.WAVES_PRECISION;
        const amount2Precision = sData?.amount2Precision ?? 0;
        const feePrecision = sData.feePrecision ?? WAVES_CONFIG.WAVES_PRECISION;
        if (appVersion[0] >= 1 && appVersion[1] >= 1 && appVersion[2] >= 0) {
            const prefixData = Buffer.concat([
                Waves.splitPath(path),
                Buffer.from([
                    amountPrecision,
                    amount2Precision,
                    feePrecision,
                    sData.dataType,
                    sData.dataVersion
                ]),
                new Buffer(Waves._toInt32Bytes(sData.dataBuffer.byteLength))
            ]);
            return Buffer.concat([prefixData, sData.dataBuffer, sData.dataBuffer, sData.dataBuffer, sData.dataBuffer]);
        } else if (appVersion[0] >= 1 && appVersion[1] >= 1 && appVersion[2] >= 0) {
            const prefixData = Buffer.concat([
                Waves.splitPath(path),
                Buffer.from([
                    amountPrecision,
                    feePrecision,
                    sData.dataType,
                    sData.dataVersion
                ]),
                new Buffer(Waves._toInt32Bytes(sData.dataBuffer.byteLength))
            ]);

            return Buffer.concat([prefixData, sData.dataBuffer, sData.dataBuffer]);
        } else {
            const prefixData = Buffer.concat([
                Waves.splitPath(path),
                Buffer.from([
                    amountPrecision,
                    feePrecision,
                    sData.dataType,
                    sData.dataVersion
                ])
            ]);

            return Buffer.concat([prefixData, sData.dataBuffer]);
        }
    }

    protected async _signData(dataBufferAsync: Uint8Array): Promise<string> {
        const dataBuffer = await dataBufferAsync;
        const maxChunkLength = WAVES_CONFIG.MAX_SIZE - 5;
        const dataLength = dataBuffer.length;
        let sendBytes = 0;
        let result;
        while (dataLength > sendBytes) {
            const chunkLength = Math.min(dataLength - sendBytes, maxChunkLength);
            const isLastByte = (dataLength - sendBytes > maxChunkLength) ? 0x00 : 0x80;
            const chainId = this.networkCode;
            const txChunk = dataBuffer.slice(sendBytes, chunkLength + sendBytes);
            sendBytes += chunkLength;
            result = await this.transport.send(0x80, 0x02, isLastByte, chainId, txChunk);
            const isError = Waves.checkError(result.slice(-2));
            if (isError) {
                throw isError;
            }
        }

        return base58Encode(result.slice(0, -2));
    }

    static checkError(data: Array<number>): { error: string, status: number } | null {
        const statusCode = data[0] * 256 + data[1];
        if (statusCode === WAVES_CONFIG.STATUS.SW_OK) {
            return null;
        }
        return { error: 'Wrong data', status: statusCode };
    }

    static splitPath(path: string) {
        const result: Array<number> = [];
        path.split('/').forEach(element => {
            let number = parseInt(element, 10);
            if (isNaN(number)) {
                return;
            }
            if (element.length > 1 && element[element.length - 1] === '\'') {
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


export interface IUserData {
    publicKey: string;
    address: string;
    statusCode: string;
}

export interface ISignData {
    dataBuffer: Uint8Array;
}

export interface ISignTxData extends ISignData{
    dataType: number;
    dataVersion: number;
    amountPrecision?: number;
    amount2Precision?: number;
    feePrecision?: number;
}

export interface ISignOrderData extends ISignData{
    dataVersion: number;
    amountPrecision?: number;
    feePrecision?: number;
}
