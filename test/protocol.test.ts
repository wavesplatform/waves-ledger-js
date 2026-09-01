import { describe, it, expect } from 'vitest';
import { buildSignPayload, resolveProtocolFromVersion, Waves } from '../src/Waves';

const PATH = "44'/5741564'/0'/0'/0'";
const TX_BYTES = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

describe('resolveProtocolFromVersion', () => {
    it('selects 1.2 for app >= 1.2.0', () => {
        expect(resolveProtocolFromVersion([1, 2, 0])).toBe('1.2');
        expect(resolveProtocolFromVersion([2, 0, 0])).toBe('1.2');
    });

    it('selects 1.1 for app >= 1.1.0 and < 1.2', () => {
        expect(resolveProtocolFromVersion([1, 1, 0])).toBe('1.1');
    });

    it('selects 1.0 for older apps', () => {
        expect(resolveProtocolFromVersion([1, 0, 9])).toBe('1.0');
    });
});

describe('buildSignPayload', () => {
    const baseSignData = {
        dataType: 4,
        dataVersion: 2,
        amountPrecision: 8,
        feePrecision: 8,
        dataBuffer: TX_BYTES,
    };

    it('builds v1.1 payload', () => {
        const payload = buildSignPayload(PATH, baseSignData, '1.1');
        expect(payload.length).toBe(20 + 4 + 4 + TX_BYTES.length * 2);
    });

    it('builds v1.2 payload', () => {
        const payload = buildSignPayload(PATH, { ...baseSignData, amount2Precision: 0 }, '1.2');
        expect(payload.length).toBe(20 + 5 + 4 + TX_BYTES.length * 4);
    });

    it('builds v1.0 legacy payload', () => {
        const payload = buildSignPayload(PATH, baseSignData, '1.0');
        expect(payload.length).toBe(20 + 4 + TX_BYTES.length);
    });
});

describe('Waves.splitPath', () => {
    it('encodes BIP32 path', () => {
        expect(Waves.splitPath(PATH).length).toBe(20);
    });
});
