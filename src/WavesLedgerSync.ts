import { default as TransportWebusb } from '@ledgerhq/hw-transport-webusb';
import { IWavesLedgerConfig } from './WavesLedger.interface';
import WavesLedger from './WavesLedger';

export class WavesLedgerSync extends WavesLedger {

    constructor(options: IWavesLedgerConfig) {
        super(
            {
                ...options,
                transport: options.transport || TransportWebusb
            },
            false,
        )
    }
}