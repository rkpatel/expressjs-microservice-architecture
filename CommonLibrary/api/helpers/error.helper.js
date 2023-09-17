const { GeneralError, BadRequest } = require('../utils/error');
const httpStatusCode = require('../utils/httpStatusCode');
const messages = require('../constants/message');

// This function will be used as middleware
// eslint-disable-next-line no-unused-vars
const handleErrors = (err, req, res, next) => {
  const errorDetails = {
    message : err.message,
    stack   : err.stack
  };
  res.error = errorDetails;
  if (err instanceof GeneralError) {
    const errorData = err.result ? err.result : null;
    return res
      .status(err.statusCode !== '' ? err.statusCode : err.getCode())
      .json({
        httpStatus       : err.statusCode !== '' ? err.statusCode : err.getCode(),
        statusMessage    : httpStatusCode.ERROR,
        userMessage      : err.message,
        errorMessage     : err.message,
        data             : err.statusCode != 400 ? errorData : null,
        validationErrors : err.statusCode == 400 ? errorData : null,
        errorDetails     : err.statusCode == 500 ? errorDetails : undefined
      });
  }

  return res.status(httpStatusCode.HTTP_SERVER_ERROR)
  .json({
    httpStatus:
      err.statusCode ? err.statusCode : httpStatusCode.HTTP_SERVER_ERROR,
    statusMessage    : httpStatusCode.ERROR,
    userMessage      : messages.GLOBAL_ERROR,
    errorMessage     : messages.GLOBAL_ERROR,
    data             : null,
    validationErrors : null,
    errorDetails
  });
};

const handleJoiErrors = (err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    // we had a joi error, let's return a custom 400 json response
    const customErrorResponse = {};
    if (err.error.details.length !== 0) {
      err.error.details.forEach((item) => {
        customErrorResponse[`${item.context.key}`] = {
          message : item.message,
          context : item.context.label,
          type    : item.type
        };
      });
    }
    next(new BadRequest('Validation Error', customErrorResponse, 400));
  } else {
    // pass on to another error handler
    next(err);
  }
};

// Catch (Global) Error in Async Method
const catchAsync = (func) => (req, res, next) => {
  func(req, res, next)
    .catch((err) => {
      if (process.env.NODE_ENV === 'local') {
        console.log('catchAsyncError', err);
      }
      next(err);
    });
};
module.exports = { handleErrors, handleJoiErrors, catchAsync };
