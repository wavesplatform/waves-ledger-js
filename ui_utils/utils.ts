import { seedUtils } from '@waves/waves-transactions';

export function decrypt(ciphertext: string, password: string) {debugger;
    try {
        const decryptedJson = seedUtils.decryptSeed(ciphertext, password);

        return JSON.parse(decryptedJson)
    } catch (e) {
        throw new Error('Invalid password');
    }
}
