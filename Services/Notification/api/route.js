const express = require('express');

const router = express.Router();
const {
  validator
} = require('../../../CommonLibrary/api/helpers/validator.helper');
const notificationController = require('./controllers/notification.controller');
const notificationValidation = require('./validations/notification.validation');

/* Notification routes */
router.post(
  '/SendNotification',
  validator.body(notificationValidation.sendNotification),
  notificationController.sendNotification
);

module.exports = router;
