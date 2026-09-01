import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

export type LedgerTransportFactory = {
    create: (openTimeout?: number, listenTimeout?: number) => Promise<any>;
};

export type CreateTransportOptions = {
    openTimeout?: number;
    listenTimeout?: number;
    preferWebHID?: boolean;
};

/**
 * Open a Ledger transport. Tries WebHID first (more reliable on Windows),
 * then falls back to WebUSB.
 */
export async function createLedgerTransport(
    options: CreateTransportOptions = {},
): Promise<any> {
    const { openTimeout, listenTimeout, preferWebHID = true } = options;
    const errors: Error[] = [];

    if (preferWebHID && typeof window !== 'undefined') {
        try {
            const TransportWebHID = (await import('@ledgerhq/hw-transport-webhid')).default;
            const existing = await TransportWebHID.openConnected();
            if (existing) {
                return existing;
            }
            return await TransportWebHID.create(openTimeout, listenTimeout);
        } catch (err) {
            errors.push(err instanceof Error ? err : new Error(String(err)));
        }
    }

    try {
        return await TransportWebUSB.create(openTimeout, listenTimeout);
    } catch (err) {
        errors.push(err instanceof Error ? err : new Error(String(err)));
    }

    const detail = errors.map((e) => e.message).join('; ');
    throw new Error(
        'Could not connect to Ledger. Ensure the device is plugged in, unlocked, ' +
        'the Waves app is open, and Ledger Live is closed. ' +
        `Detail: ${detail}`,
    );
}

/** Auto-select transport on each connection attempt. */
export const AutoTransport: LedgerTransportFactory = {
    create: (openTimeout, listenTimeout) =>
        createLedgerTransport({ openTimeout, listenTimeout }),
};
