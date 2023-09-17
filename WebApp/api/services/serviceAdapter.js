/* eslint-disable no-useless-catch */
const axios = require('axios');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { apiAdapter } = require('./apiAdapter');

const requestServiceApi = async (req, res, method, path, payload = '') => {
  try {
    const options = {
      method,
      headers : { 'content-type': 'application/json', Authorization: req.headers.authorization },
      data    : payload !== '' ? payload : req.body,
      url     : path
    };
    const resp = await axios(options);
    return resp;
  } catch (error) {
    if (error.response) {
      res.error = error.response?.data?.errorDetails;
    }
    throw error;
  }
};

module.exports = {
  sendNotification: async (req, res, payload) => {
    try {
      const notificationServicePath = await getSecretKey(
        SECRET_KEYS.NOTIFICATION_SERVICE_URL
      );
      const sendNotificationReqPath = `${notificationServicePath}/Notification/SendNotification`;
      const response = await requestServiceApi(req, res, 'POST', sendNotificationReqPath, payload);
      return response;
    } catch (err) {
      throw err;
    }
  },
  addAuditLog: async (req, res, payload) => {
    const auditlogServicePath = await getSecretKey(SECRET_KEYS.AUDIT_LOG_SERVICE_URL);
    const addAuditLogPath = `${auditlogServicePath}/AuditLog/AddAuditLog`;
    try {
      const response = await requestServiceApi(req, res, 'POST', addAuditLogPath, payload);
      return response;
    } catch (err) {
      console.log('err', err);
      throw err;
    }
  },
  addErrorLog: async (req, res, payload) => {
    const auditlogServicePath = await getSecretKey(SECRET_KEYS.AUDIT_LOG_SERVICE_URL);
    const addErrorLogPath = `${auditlogServicePath}/AuditLog/AddErrorLog`;
    try {
      const response = await requestServiceApi(req, res, 'POST', addErrorLogPath, payload);
      return response;
    } catch (err) {
      console.log('err', err);
      throw err;
    }
  }
};
