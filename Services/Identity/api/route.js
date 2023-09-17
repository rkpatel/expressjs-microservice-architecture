const express = require('express');

const router = express.Router();
const {
  validator
} = require('../../../CommonLibrary/api/helpers/validator.helper');
const authController = require('./controllers/auth.controller');
const authValidation = require('./validations/auth.validation');

/* Authentication routes */
router.post(
  '/AuthenticateUser',
  validator.body(authValidation.authenticateUser),
  authController.authenticateUser
);
router.post(
  '/UpdateNewPassword',
  validator.body(authValidation.updateNewPassword),
  authController.updateNewPassword
);
router.post(
  '/SendForgotPasswordEmail',
  validator.body(authValidation.sendForgotPasswordEmail),
  authController.sendForgotPasswordEmail
);
router.post(
  '/VerifyResetpasswordLink',
  validator.body(authValidation.verifyResetPasswordLink),
  authController.verifyResetPasswordLink
);

module.exports = router;
