const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  GeneralResponse
} = require('../../../../CommonLibrary/api/utils/response');
const { BadRequest } = require('../../../../CommonLibrary/api/utils/error');
const httpStatusCode = require('../../../../CommonLibrary/api/utils/httpStatusCode');
const messages = require('../constants/message');
const commonMessages = require('../../../../CommonLibrary/api/constants/message');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');
const {
  getDateUTC
} = require('../../../../CommonLibrary/api/helpers/datetime.helper');

const getExecutionPath = methodName => `${__filename}\\${methodName}`;
const getSortBy = async sortField => {
  let sortby = '';
  if (sortField === 'message') {
    sortby = 'Message';
  } else if (sortField === 'description') {
    sortby = 'StackTrace';
  } else if (sortField === 'userName') {
    sortby = 'UserName';
  } else {
    sortby = 'TimeStamp';
  }
  return sortby;
};
module.exports = {
  getErrorLogs: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('getErrorLogs');
    const errors = await prisma.ErrorLog.findMany({});
    if (errors) {
      const errorsData = [];
      errors.forEach(error => {
        errorsData.push({
          errorLogId      : error.ErrorLogId,
          userId          : error.UserId,
          message         : error.Message,
          stackTrace      : error.StackTrace,
          ipAddress       : error.IPAddress,
          timeStamp       : error.TimeStamp,
          event           : error.Event,
          userName        : error.UserName,
          auditErrorLogId : error.AuditErrorLogId
        });
      });
      return next(
        new GeneralResponse(
          messages.GET_ERRORS,
          errorsData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  }),

  getErrorLogDetail: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('getErrorLogDetail');
    const errorLogId = parseInt(req?.query?.errorLogId, 10);
    const error = await prisma.ErrorLog.findFirst({
      where: { ErrorLogId: errorLogId }
    });
    let errordata = {};
    if (error) {
      errordata = {
        errorLogId      : error.ErrorLogId,
        userId          : error.UserId,
        message         : error.Message,
        stackTrace      : error.StackTrace,
        ipAddress       : error.IPAddress,
        timeStamp       : error.TimeStamp,
        event           : error.Event,
        userName        : error.UserName,
        auditErrorLogId : error.AuditErrorLogId
      };
      return next(
        new GeneralResponse(
          commonMessages.SUCCESS,
          errordata,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  }),

  addErrorLog: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('addErrorLog');

    const {
      userId,
      message,
      stackTrace,
      ipAdress,
      event,
      userEmail,
      auditErrorLogId
    } = req.body;

    let errorMessage;

    const defaultUser = {
      UserId : 1,
      Email  : 'Admin@solutionaccelarator.com'
    };

    if (message) {
      errorMessage = message.substring(0, message.indexOf('.')) || message;
    }

    const errorLog = {
      UserId          : userId || defaultUser.UserId,
      Message         : errorMessage,
      StackTrace      : stackTrace,
      IPAddress       : ipAdress || '::1',
      TimeStamp       : new Date(getDateUTC()),
      Event           : event,
      UserName        : userEmail || defaultUser.Email,
      AuditErrorLogId : auditErrorLogId
    };
    await prisma.ErrorLog.create({
      data: errorLog
    });

    return next(
      new GeneralResponse(
        messages.ADD_ERRORLOG_SUCCESS,
        null,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),

  getErrorLogLazyLoad: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('getErrorLogLazyLoad');
    const {
      searchText,
      first,
      rows,
      sortField,
      sortOrder,
      parameters,
      filters
    } = req.body;
    let sortby = 'TimeStamp';
    const sortorder = 'desc';
    if (sortField) {
      sortby = await getSortBy(sortField);
    }
    const errors = await prisma.ErrorLog.findMany({
      skip : first,
      take : rows,
      where:
        searchText && searchText !== ''
          ? {
            OR: [
              { Message: { contains: searchText } },
              { StackTrace: { contains: searchText } }
            ]
          }
          : {},
      orderBy: {
        [sortby]:
          sortOrder && sortOrder !== '' ? sortOrder.toLowerCase() : sortorder
      }
    });
    const errorsCount = await prisma.ErrorLog.count({
      where:
        searchText && searchText !== ''
          ? {
            OR: [
              { Message: { contains: searchText } },
              { StackTrace: { contains: searchText } }
            ]
          }
          : {}
    });
    if (errors) {
      const errorsData = [];
      errors.forEach(error => {
        errorsData.push({
          errorLogId      : error.ErrorLogId,
          userId          : error.UserId,
          message         : error.Message,
          stackTrace      : error.StackTrace,
          ipAddress       : error.IPAddress,
          timeStamp       : error.TimeStamp,
          event           : error.Event,
          userName        : error.UserName,
          auditErrorLogId : error.AuditErrorLogId
        });
      });
      const responseData = {
        errorLogViewModelList : errorsData,
        count                 : errorsCount
      };
      return next(
        new GeneralResponse(
          messages.GET_ERRORS,
          responseData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  })
};
