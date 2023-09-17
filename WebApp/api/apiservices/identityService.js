const express = require('express');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { apiAdapter } = require('../services/apiAdapter');
const { sendNotification } = require('../services/serviceAdapter');
const { catchAsync } = require('../../../CommonLibrary/api/helpers/error.helper');

const router = express.Router();

const getIdentityServiceURL = async reqPath => {
  const baseURL = await getSecretKey(SECRET_KEYS.IDENTITY_SERVICE_URL);
  return (baseURL + reqPath);
};

router.post('/Identity/AuthenticateUser', catchAsync(async (req, res) => {
  const completeReqURL = await getIdentityServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/Identity/UpdateNewPassword', catchAsync(async (req, res) => {
  const completeReqURL = await getIdentityServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/Identity/SendForgotPasswordEmail', catchAsync(async (req, res) => {
  const completeReqURL = await getIdentityServiceURL(req.path);
  const responseData = await apiAdapter(req, res, 'POST', completeReqURL, true);
  if (responseData) {
    sendNotification(req, res, responseData.responseData.data).then(resp => {
      res.status(resp.status).send(resp.data);
    }).catch(err => {
      console.error(err);
      res.status(responseData.responseStatus).send(responseData.responseData);
    });
  }
}));

router.post('/Identity/VerifyResetpasswordLink', catchAsync(async (req, res) => {
  const completeReqURL = await getIdentityServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

module.exports = router;
