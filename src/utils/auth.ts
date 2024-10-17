import CryptoJS from 'crypto-js';

const secretKey = '421a78811d5f4e8e8dff8a411b01fc1d'

export const encryptToken = (objToken?: any) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse(secretKey);

    var ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(objToken), key, {
        keySize: 16,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    return ciphertext
};

export const decryptToken = (encryptedToken: string) => {
    const decodedToken = decodeURIComponent(encryptedToken);

    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse(secretKey);

    const decrypted = CryptoJS.AES.decrypt(decodedToken, key, {
        keySize: 16,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    const decryptedToken = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedToken) {
        throw new Error('Decryption failed: Invalid key or corrupted data');
    }

    return decryptedToken;
};
