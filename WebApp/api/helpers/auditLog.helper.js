const { v4: uuidv4 } = require('uuid');
const { getFormatDateUTC } = require('../../../CommonLibrary/api/helpers/datetime.helper');
const { addAuditLog, addErrorLog } = require('../services/serviceAdapter');

module.exports = {
  handleAuditLog: (req, res, next) => {
    const requestBody = { ...req.body };
    const startTime = getFormatDateUTC('YYYY-MM-DD HH:mm:ss.SSS');
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [
    ];
    let addedAuditLogId;
    const auditErrorLogId = uuidv4();
    const auditLogReqPayload = {
      auditLogId    : 0,
      clientURL     : `${req.get('host')}${req.originalUrl}`,
      userEmail     : req.token?.Email ? req.token.Email : '',
      requestObject : requestBody,
      starTime      : new Date(startTime),
      auditErrorLogId
    };
    addAuditLog(req, res, auditLogReqPayload).then(response => {
      addedAuditLogId = response?.data?.data?.id;
    }).catch(err => {
      console.log(err);
    });

    res.write = function (chunk) {
      chunks.push(chunk);
      return oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
      if (chunk) { chunks.push(chunk); }
      const responseObject = Buffer.concat(chunks)?.toString('utf8');
      const endTime = getFormatDateUTC('YYYY-MM-DD HH:mm:ss.SSS');
      const auditLogResPayload = {
        ...(addedAuditLogId ? { auditLogId: addedAuditLogId } : auditLogReqPayload),
        responseObject,
        endTime       : new Date(endTime),
        executionPath : res.executionpath
      };
      addAuditLog(req, res, auditLogResPayload).catch(err => {
        console.log(err);
      });

      if (res.error) {
        const ipAdress = req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress;

        const errorLog = {
          userId     : req.token?.UserId,
          message    : (res.error).message,
          stackTrace : (res.error).stack,
          ipAddress  : ipAdress,
          timeStamp  : new Date(endTime),
          event      : req.originalUrl,
          userEmail  : req.token?.Email,
          auditErrorLogId
        };
        console.log('errorLog', errorLog);
        addErrorLog(req, res, errorLog).catch(err => {
          console.log(err);
        });
      }

      oldEnd.apply(res, arguments);
    };

    next();
  }
};
