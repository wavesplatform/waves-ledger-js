import { libs } from '@waves/signature-generator';
declare const Buffer;

const WAVES_CONFIG = {
    STATUS: {
        SW_OK: 0x9000,
        SW_USER_CANCELLED: 0x9100,
        SW_CONDITIONS_NOT_SATISFIED: 0x6985,
        SW_BUFFER_OVERFLOW: 0x6990,
        SW_INCORRECT_P1_P2: 0x6A86,
        SW_INS_NOT_SUPPORTED: 0x6D00,
        SW_CLA_NOT_SUPPORTED:  0x6E00,
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
    VERSIONS: [[0, 9, 6], [0, 9, 7]],
};

export class Waves {

    protected transport;
    protected networkCode;
    protected _version;

    constructor(transport, networkCode = WAVES_CONFIG.MAIN_NET_CODE) {
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

    async getWalletPublicKey(path, verify = false): Promise<IUserData> {
        const buffer = Waves.splitPath(path);
        const p1 = verify ? 0x80 : 0x00;
        const response = await this.transport.send(0x80, 0x04, p1, this.networkCode, buffer);
        const publicKey = libs.base58.encode(response.slice(0, WAVES_CONFIG.PUBLIC_KEY_LENGTH));
        const address = response
            .slice(WAVES_CONFIG.PUBLIC_KEY_LENGTH, WAVES_CONFIG.PUBLIC_KEY_LENGTH + WAVES_CONFIG.ADDRESS_LENGTH)
            .toString("ascii");
        const statusCode = response
            .slice(-WAVES_CONFIG.STATUS_LENGTH)
            .toString("hex");
        return { publicKey, address, statusCode };
    }

    async signTransaction (path, amountPrecession, txData, version = 2): Promise<string> {
        
        const transactionType = txData[0];
        const version2 = [transactionType, version];
        const type = await this._versionNum();
        
        if (transactionType === 4 ) {
            if (type === 0) {
                return await this.signSomeData(path, txData);
            }
        }
        
        const prefixData = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                amountPrecession,
                WAVES_CONFIG.WAVES_PRECISION,
            ]),
        ]);
        
        const dataForSign = await this._fillData(prefixData , txData, version2);
        return await this._signData(dataForSign);
    }

    async signOrder (path, amountPrecession, txData): Promise<string> {
        const prefixData = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                amountPrecession,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.ORDER,
            ])
        ]);
    
        const dataForSign = await this._fillData(prefixData , txData);
        return await this._signData(dataForSign);
    }

    async signSomeData(path, msgBuffer): Promise<string> {
        const prefixData = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.SOME_DATA,
            ])
        ]);
    
        const dataForSign = await this._fillData(prefixData , msgBuffer);
        return await this._signData(dataForSign);
    }

    async signRequest(path, msgBuffer): Promise<string> {
        const prefixData = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.REQUEST,
            ])
        ]);
        const dataForSign = await this._fillData(prefixData , msgBuffer);
        return await this._signData(dataForSign);
    }

    async signMessage(path, msgBuffer): Promise<string> {
        const prefixData = Buffer.concat([
            Waves.splitPath(path),
            Buffer.from([
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.WAVES_PRECISION,
                WAVES_CONFIG.SIGNED_CODES.MESSAGE,
            ])
        ]);

        const dataForSign = await this._fillData(prefixData , msgBuffer);
        return await this._signData(dataForSign);
    }

    async getVersion() {
        if (!this._version) {
            this._version = this.transport.send(0x80, 0x06, 0, 0);
        }
        
        try {
            const version = await this._version;
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
    
    protected async _versionNum() {
        const version = await this.getVersion();
        return WAVES_CONFIG.VERSIONS.reduce((acc, conf_version, index) => {
            const isMyVersion = !version.some((num, ind) => conf_version[ind] > num);
            return isMyVersion ? index : acc;
        }, 0);
    }
    
    protected async _fillData(prefixBuffer, dataBuffer, ver2 = [0]) {
        const type = await this._versionNum();
        
        switch (type) {
            case 0:
                return Buffer.concat([prefixBuffer, dataBuffer]);
            case 1:
            default:
                return Buffer.concat([prefixBuffer, Buffer.from(ver2), dataBuffer]);
        }
    }
    
    protected async _signData(dataBufferAsync): Promise<string> {
        const dataBuffer = await dataBufferAsync;
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
            result = await this.transport.send(0x80, 0x02, isLastByte, chainId, txChank);
            const isError = Waves.checkError(result.slice(-2));
            if (isError) {
                throw isError;
            }
        }

        return libs.base58.encode(result.slice(0,-2));
    }

    static checkError(data): {error: string, status: number} {
        const statusCode = data[0] * 256 + data[1];
        if (statusCode === WAVES_CONFIG.STATUS.SW_OK) {
            return null;
        }
        return {error: 'Wrong data', status: statusCode};
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


export interface IUserData {
    publicKey: string;
    address: string;
    statusCode: string;
}
