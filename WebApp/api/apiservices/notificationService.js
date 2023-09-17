const express = require('express');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { apiAdapter } = require('../services/apiAdapter');
const { catchAsync } = require('../../../CommonLibrary/api/helpers/error.helper');

const router = express.Router();

const getNotificationServiceURL = async reqPath => {
  const baseURL = await getSecretKey(SECRET_KEYS.NOTIFICATION_SERVICE_URL);
  return (baseURL + reqPath);
};

router.post('/Notification/SendNotification', catchAsync(async (req, res) => {
  const completeReqURL = await getNotificationServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));
module.exports = router;
