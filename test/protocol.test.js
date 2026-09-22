const assert = require('assert');
const { Waves } = require('../lib/Waves');
const ledger = require('../lib/WavesLedger');

const PATH = "44'/5741564'/0'/0'/0'";
const DATA = Buffer.from([1]);

class MockTransport {
    constructor(version) {
        this.version = version;
    }

    decorateAppAPIMethods() {}

    async send() {
        return Buffer.from([
            ...this.version,
            0x90,
            0x00
        ]);
    }
}

async function getSigningDataLength(version) {
    const waves = new Waves(new MockTransport(version));

    const result = await waves._fillDataForSign(PATH, {
        amountPrecision: 8,
        amount2Precision: 0,
        feePrecision: 8,
        dataType: 4,
        dataVersion: 2,
        dataBuffer: DATA
    });

    return result.length;
}

async function run() {
    // Versions below 1.1.0 use a 24-byte prefix and one data copy.
    assert.strictEqual(
        await getSigningDataLength([0, 9, 6]),
        25
    );

    // Versions starting from 1.1.0 use a 28-byte prefix and two data copies.
    assert.strictEqual(
        await getSigningDataLength([1, 1, 0]),
        30
    );

    // Waves App 1.2.2 also uses the 28-byte, two-copy protocol.
    assert.strictEqual(
        await getSigningDataLength([1, 2, 2]),
        30
    );

    assert.strictEqual(
        typeof ledger.WavesLedgerSync,
        'function',
        'WavesLedgerSync must be exported'
    );

    console.log('Protocol selection tests passed');
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});