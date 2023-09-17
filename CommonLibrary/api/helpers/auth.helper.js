const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { UnAuthorized } = require('../utils/error');

const SALT_ROUNDS = 10;
const { SECRET_KEYS } = require('../constants/secretManagerKeys');
const { getSecretKey } = require('./azureKeyVault.helper');

module.exports = {
  /**
   * Middleware for Checking User Authentication
   */
  authenticate: async (req, res, next) => {
    const JWT_SECRET_KEY = await getSecretKey(SECRET_KEYS.JWT_DMS_KEY);
    const secretKey = Buffer.from(JWT_SECRET_KEY, 'base64');

    // Express headers are auto converted to lowercase
    let token = req.headers['x-access-token'] || req.headers.authorization;
    if (token) {
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove Bearer from string
      }
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          console.log('err', err);
          next(new UnAuthorized('auth token is invalid'));
        } else {
          req.token = decoded;
          next();
        }
      });
    } else {
      next(new UnAuthorized('auth token not supplied'));
    }
  },

  /**
   * Middleware for Generating a new JWT Token
   */
  generateToken: async (data, expiresIn = '1d') => {
    const JWT_SECRET_KEY = await getSecretKey(SECRET_KEYS.JWT_DMS_KEY);
    const secretKey = Buffer.from(JWT_SECRET_KEY, 'base64');
    const token = jwt.sign(data, secretKey, {
      expiresIn
    });
    return token;
  },

  /**
   * Method to generate password hash
   */
  hashPassword: async (password) => bcrypt.hash(password, SALT_ROUNDS),

  /**
   * Method to compare hashed and text password
   */
  comparePassword: async (password, hashedPassword) => bcrypt.compare(password, hashedPassword)
};
