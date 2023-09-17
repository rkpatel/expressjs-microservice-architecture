const express = require('express');
const { apiAdapter } = require('../services/apiAdapter');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { catchAsync } = require('../../../CommonLibrary/api/helpers/error.helper');
const { sendNotification } = require('../services/serviceAdapter');

const router = express.Router();

const getUserManagementServiceURL = async reqPath => {
  const baseURL = await getSecretKey(SECRET_KEYS.USER_MANAGEMENT_SERVICE_URL);
  return (baseURL + reqPath);
};

router.post('/UserManagement/GetAllUsersListing', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/UserManagement/DeleteUsers', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/UserManagement/AddEditUser', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
  if (req.body.userId === 0) {
    const responseData = await apiAdapter(req, res, 'POST', completeReqURL, true);
    if (responseData) {
      sendNotification(req, res, responseData.responseData.data).then(resp => {
        res.status(resp.status).send(resp.data);
      }).catch(err => {
        console.error(err);
        res.status(responseData.responseStatus).send(responseData.responseData);
      });
    }
  } else {
    await apiAdapter(req, res, 'POST', completeReqURL);
  }
}));

router.post('/UserManagement/GetUserById', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/UserManagement/UserSignUp', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
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

router.post('/UserManagement/ActivateUser', catchAsync(async (req, res) => {
  const completeReqURL = await getUserManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));
module.exports = router;
