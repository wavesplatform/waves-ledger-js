const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const base58Encode = (buffer: Uint8Array): string => {

    if (!buffer.length) return '';

    const digits = [0];

    for (let i = 0; i < buffer.length; i++) {

        for (let j = 0; j < digits.length; j++) {
            digits[j] <<= 8;
        }

        digits[0] += buffer[i];
        let carry = 0;

        for (let k = 0; k < digits.length; k++) {
            digits[k] += carry;
            carry = (digits[k] / 58) | 0;
            digits[k] %= 58;
        }

        while (carry) {
            digits.push(carry % 58);
            carry = (carry / 58) | 0;
        }

    }

    for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) {
        digits.push(0);
    }

    return digits.reverse().map(function (digit) {
        return ALPHABET[digit];
    }).join('');

}


const ALPHABET_MAP = ALPHABET.split('').reduce((map:any, c, i) => {
    map[c] = i;
    return map;
}, {});
export const base58Decode = (string: string): Uint8Array => {

    if (!string.length) return new Uint8Array(0);

    const bytes = [0];

    for (let i = 0; i < string.length; i++) {

        const c = string[i];
        if (!(c in ALPHABET_MAP)) {
            throw `There is no character "${c}" in the Base58 sequence!`;
        }

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] *= 58;
        }

        bytes[0] += ALPHABET_MAP[c];
        let carry = 0;

        for (let j = 0; j < bytes.length; j++) {
            bytes[j] += carry;
            carry = bytes[j] >> 8;
            bytes[j] &= 0xff;
        }

        while (carry) {
            bytes.push(carry & 0xff);
            carry >>= 8;
        }

    }

    for (let i = 0; string[i] === '1' && i < string.length - 1; i++) {
        bytes.push(0);
    }

    return new Uint8Array(bytes.reverse());

}

export const stringFromUTF8Array = (array: Uint8Array) => {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
            c = array[i++];
            switch(c >> 4)
            {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
                case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
}