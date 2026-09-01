import { IUserData } from './Waves';

export interface IWavesLedgerConfig {
    debug?: boolean;
    openTimeout?: number;
    listenTimeout?: number;
    exchangeTimeout?: number;
    networkCode?: number;
    transport?: { create: (openTimeout?: number, listenTimeout?: number) => Promise<any> };
    signProtocol?: SignProtocol;
    preferWebHID?: boolean;
}

export type SignProtocol = 'auto' | '1.0' | '1.1' | '1.2';

export interface IUser extends IUserData {
    id: number;
    path: string;
}

export const WAVES_MAINNET_CODE = 0x57;
export const WAVES_TESTNET_CODE = 0x54;
