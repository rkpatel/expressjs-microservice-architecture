const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { BadRequest } = require('../../../../CommonLibrary/api/utils/error');
const httpStatusCode = require('../../../../CommonLibrary/api/utils/httpStatusCode');
const messages = require('../constants/message');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');
const {
  GeneralResponse
} = require('../../../../CommonLibrary/api/utils/response');

const prisma = new PrismaClient();
const getExecutionPath = methodName => `${__filename}\\${methodName}`;

// Convert object with bigint value into json
const convertBigIntToJson = data => JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)).replace(/"(-?\d+)n"/g, (_, a) => a)
);

module.exports = {
  addAuditLog: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('addAuditLog');
    const {
      auditLogId,
      clientURL,
      userEmail,
      requestObject,
      starTime,
      responseObject,
      endTime,
      auditErrorLogId,
      executionPath
    } = req.body;
    let auditLogRes;
    let controllerFile;
    let method;
    if (requestObject) {
      Object.keys(requestObject).forEach(key => {
        const keyName = key.toLowerCase();
        if (keyName.includes('password')) {
          requestObject[key] = '';
        }
      });
    }
    if (executionPath) {
      const executionPathArr = executionPath?.split(path.sep);
      const executionPathArrLength = executionPathArr?.length;
      if (executionPathArrLength > 0) {
        controllerFile = executionPathArr[executionPathArrLength - 2];
        controllerFile = controllerFile?.substring(
            0,
            controllerFile.lastIndexOf('.')
        );
        method = executionPathArr[executionPathArrLength - 1];
      }
    }

    const auditLog = {
      ClientURL     : clientURL,
      UserEmail     : userEmail,
      Requestobject : requestObject
          ? JSON.stringify(requestObject)
          : undefined,
      Startime        : starTime,
      AuditErrorLogId : auditErrorLogId,
      Responseobject  : responseObject,
      EndTime         : endTime,
      Controller      : controllerFile,
      Method          : method
    };

    if (auditLogId === 0) {
      auditLogRes = await prisma.APIAudit.create({
        data: auditLog
      });
    } else {
      const auditLogExist = await prisma.APIAudit.count({
        where: { id: auditLogId }
      });

      if (auditLogExist === 0) {
        return next(new BadRequest(messages.USER_NOT_FOUND));
      }
      auditLogRes = await prisma.APIAudit.update({
        where: {
          id: auditLogId
        },
        data: auditLog
      });
    }
    const auditLogResJson = convertBigIntToJson(auditLogRes);

    return next(
        new GeneralResponse(
          messages.ADD_AUDITLOG_SUCCESS,
          auditLogResJson,
          httpStatusCode.HTTP_SUCCESS
        )
    );
  }),
  getAllAuditTrailListing: catchAsync(async (req, res, next) => {
    res.executionPath = getExecutionPath('getAllAuditTrailListing');
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  })
};
