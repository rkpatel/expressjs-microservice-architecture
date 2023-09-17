/**
 * The Express.js framework makes it very easy to develop an application which can be used to handle multiple types of requests like the GET, PUT, and POST and DELETE requests.
 */
const express = require('express');

const app = express();

/**
 * helmet => Helmet helps you secure your Express apps by setting various HTTP headers.
 * It's not a silver bullet, but it can help!
 */
const helmet = require('helmet');

app.use(helmet());

/**
 * dotenv For Managing Environments in node js
 */
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env';
dotenv.config({ path: envFile });

/** Express middleware - cors
 * enables cross-origin-resource-sharing for express apis
 */
const cors = require('cors');

app.use(cors());

/** Express middleware - body-parser
 * body-parser extract the entire body portion of an incoming request stream and exposes it on req.body
 */
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' })); // support parsing of application/json type post data
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // support parsing of application/x-www-form-urlencoded post data

/**
 * Express User Agent for getting Session Data
 */
app.use(require('express-useragent').express());

/**
 * Audit Log Handling
 */
// app.use(require('../CommonLibrary/api/helpers/auditLog.helper').handleAuditLog);

/**
 * Routes
 */
app.use('/Notification/', require('./api/route')); // Version 1

/**
 * Response Handling
 */
app.use(require('../../CommonLibrary/api/helpers/response.helper'));

/**
 * After your routes add a standard express error handler. This will be passed the Joi
 * error, plus an extra "type" field so we can tell what type of validation failed
 */
app.use(
  require('../../CommonLibrary/api/helpers/error.helper').handleJoiErrors
);

/**
 * Error Handling
 */
app.use(require('../../CommonLibrary/api/helpers/error.helper').handleErrors);

/**
 * Fetch port from KeyVault and run server on it
 */

const {
  getSecretKey
} = require('../../CommonLibrary/api/helpers/azureKeyVault.helper');
const {
  SECRET_KEYS
} = require('../../CommonLibrary/api/constants/secretManagerKeys');

getSecretKey(SECRET_KEYS.NOTIFICATION_SERVICE_URL).then(res => {
  console.log('res', res);
  const url = new URL(res);
  const { hostname, port } = url;
  app.listen(port, hostname, () => {
    console.log(`Server running on : ${hostname}:${port}`);
  });
});
