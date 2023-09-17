const { GeneralResponse } = require('../utils/response');
const statusCode = require('../utils/httpStatusCode');

const handleResponse = (response, req, res, next) => {
  if (response instanceof GeneralResponse) {
    return res.status(statusCode.HTTP_SUCCESS).json({
      httpStatus       : statusCode.HTTP_SUCCESS,
      statusMessage    : statusCode.SUCCESS,
      userMessage      : response.message || null,
      errorMessage     : '',
      data             : response.result || null,
      validationErrors : null
    });
  }
  return next(response);
};

module.exports = handleResponse;
