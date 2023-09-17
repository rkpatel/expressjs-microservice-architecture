const httpStatusCode = require('./httpStatusCode');

class GeneralResponse {
  constructor(message, result, statusCode = '') {
    this.message = message;
    this.statusCode = statusCode == '' ? httpStatusCode.HTTP_SUCCESS : statusCode;
    this.result = result;
  }
}

module.exports = {
  GeneralResponse
};
