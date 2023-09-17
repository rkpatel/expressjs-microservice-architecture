const axios = require('axios');
const { SECRET_KEYS } = require('../constants/secretManagerKeys');
const { getSecretKey } = require('./azureKeyVault.helper');

module.exports = {
  validateReCaptcha: async (captchaResponse) => {
    try {
      const captchaSecretKey = await getSecretKey(
        SECRET_KEYS.CAPTCHA_SECRET_KEY
      );
      const response = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecretKey}&response=${captchaResponse}`);
      const responseData = response.data;
      return !!responseData.success;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }
};
