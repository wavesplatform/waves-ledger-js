import { FormEvent } from "react";
import { decrypt } from "./utils";

const decryptForm = document.querySelector('.decrypt-form');
const ciphertextFld = document.querySelector('.ciphertext');
const passworFld = document.querySelector('.password');
const decryptBtn = document.querySelector('.action');
const resultFld = document.querySelector('.result');

decryptForm!.addEventListener('submit', submit);

// (ciphertextFld as HTMLInputElement).value = "U2FsdGVkX1/V9HIcNwNK0eNFUh8wvl7LwpxjaWqcqUC9rIfnEOMnpXgMH1/s0Ym9Lk6FKGl6k27I2giMw/L/1piVw2ngSGeqbTluP+/GC8e2qmCKb6wpOikkKDwVhJFU+CR5kT/IQEukr89Wrrb7wHfUWx1oMBRPh0md2VqOwx8FStkIvkaPBNdBgJ9jdUFtToPaeYTgGKeinX1/e5hsVc6vB3LYp0Nur//g+bGmGI53O1dO+ki1uVPrblonpEcKaD9hwOTxG/IrgX5VXt+TvMyqYX68Opa7JI1eEQBCdM4aGX+FPYtlbJbBGguF/lA0FYVvhxpwKQhoY3Hya3uehhBqwzScztl3kLLwms05cDlmD4uaEwZKG0Z5gOMgW6jc2koAECGdkDfSA5sQ+G2G/Q==";
// (passworFld as HTMLInputElement).value = "zaq12345";

function submit(ev: any) {
    ev.preventDefault();

    const ciphertext: string = (ciphertextFld as HTMLInputElement).value;
    const password: string = (passworFld as HTMLInputElement).value;

    let result;
    
    try {
        const json = decrypt(ciphertext, password);
        result = JSON.stringify(json, null, ' ');
    } catch(er) {
        result = er.toString();
    }

    (resultFld as HTMLTextAreaElement).value = result;
}
