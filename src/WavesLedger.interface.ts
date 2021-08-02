import '@babel/polyfill';
import { IUserData } from './Waves';

export interface IWavesLedger {
    debug?: boolean;
    openTimeout?: number;
    listenTimeout?: number;
    exchangeTimeout?: number;
    networkCode?: number,
    transport?: any;
}

export interface IUser extends IUserData {
    id: number;
    path: string;
}
