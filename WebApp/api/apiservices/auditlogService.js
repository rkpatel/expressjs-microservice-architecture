const express = require('express');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { apiAdapter } = require('../services/apiAdapter');
const { catchAsync } = require('../../../CommonLibrary/api/helpers/error.helper');

const router = express.Router();

const getauditlogServiceURL = async reqPath => {
  const baseURL = await getSecretKey(SECRET_KEYS.AUDIT_LOG_SERVICE_URL);
  const updatedReqPath = reqPath.replace(/ErrorLog/, 'AuditLog');
  return (baseURL + updatedReqPath);
};

router.post('/AuditLog/AddAuditLog', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));
router.get('/AuditLog/GetAllAuditTrailListing', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.path);
  await apiAdapter(req, res, 'GET', completeReqURL);
}));
router.get('/ErrorLog/GetErrorLogs', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.path);
  await apiAdapter(req, res, 'GET', completeReqURL);
}));
router.get('/ErrorLog/GetErrorLogDetail', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.url);
  await apiAdapter(req, res, 'GET', completeReqURL);
}));
router.post('/ErrorLog/AddErrorLog', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));
router.post('/ErrorLog/GetErrorLogLazyLoad', catchAsync(async (req, res) => {
  const completeReqURL = await getauditlogServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

module.exports = router;
