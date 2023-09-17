const crypto = require('crypto');
const { SECRET_KEYS } = require('../constants/secretManagerKeys');
const { getSecretKey } = require('./azureKeyVault.helper');

const algorithm = 'aes-128-gcm';

module.exports = {
  encryptQueryString: async (text) => {
    const encryptionKey = await getSecretKey(SECRET_KEYS.ENCRYPTION_KEY);
    // const encryptionKey = '!#%$@1234567890!';
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

    const res = Buffer.concat([iv, cipher.update(text), cipher.final(), cipher.getAuthTag()]);
    return res.toString('base64url');
  },

  decryptQueryString: async (text) => {
    const encryptionKey = await getSecretKey(SECRET_KEYS.ENCRYPTION_KEY);
    // const encryptionKey = '!#%$@1234567890!';
    // eslint-disable-next-line no-param-reassign
    text = text instanceof Buffer ? text : Buffer.from(text, 'base64url');
    const tag = text.slice(text.length - 16, text.length);
    const iv = text.slice(0, 12);
    const toDecrypt = text.slice(12, text.length - tag.length);

    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    decipher.setAuthTag(tag);

    const res = Buffer.concat([decipher.update(toDecrypt), decipher.final()]);
    return res.toString('utf8');
  }
};
