/* eslint-disable no-use-before-define */
const httpStatusCode = require('./httpStatusCode');

class GeneralError extends Error {
  constructor(message, result = '', statusCode = '') {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.result = result === '' ? null : result;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return httpStatusCode.HTTP_BAD_REQUEST;
    }
    if (this instanceof NotFound) {
      return httpStatusCode.HTTP_NOT_FOUND;
    }
    if (this instanceof UnAuthorized) {
      return httpStatusCode.HTTP_UN_AUTHORIZED;
    }
    if (this instanceof ServiceNotAvailable) {
      return httpStatusCode.HTTP_SERVICE_NOT_AVAILABLE;
    }
    return httpStatusCode.HTTP_SERVER_ERROR;
  }
}

class BadRequest extends GeneralError {}
class NotFound extends GeneralError {}
class UnAuthorized extends GeneralError {}
class ServiceNotAvailable extends GeneralError {}

module.exports = {
  GeneralError,
  BadRequest,
  NotFound,
  UnAuthorized,
  ServiceNotAvailable
};
