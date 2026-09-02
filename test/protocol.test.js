const assert = require('assert');
const { Waves } = require('../lib/Waves');

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
    // 28-byte prefix + two 1-byte data copies.
    assert.strictEqual(
        await getSigningDataLength([1, 2, 1]),
        30
    );

    // 29-byte prefix + four 1-byte data copies.
    assert.strictEqual(
        await getSigningDataLength([1, 2, 2]),
        33
    );

    // 1.2.2 is an exact exception. 1.2.3 uses the two-copy protocol.
    assert.strictEqual(
        await getSigningDataLength([1, 2, 3]),
        30
    );

    console.log('Protocol selection tests passed');
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});