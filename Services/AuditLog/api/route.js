const express = require('express');

const router = express.Router();
const {
  validator
} = require('../../../CommonLibrary/api/helpers/validator.helper');
const auditlogController = require('./controllers/auditlog.controller');
const auditlogValidation = require('./validations/auditlog.validation');
const errorlogController = require('./controllers/errorlog.controller');
const errorlogValidation = require('./validations/errorlog.validation');
/* AuditLog routes */
router.post(
  '/AddAuditLog',
  validator.body(auditlogValidation.addAuditLog),
  auditlogController.addAuditLog
);
router.post(
  '/GetAllAuditTrailListing',
  validator.body(auditlogValidation.getAllAuditTrailListing),
  auditlogController.getAllAuditTrailListing
);

/* Errorlog routes */
router.get(
  '/GetErrorLogs',
  validator.body(errorlogValidation.getErrorLogs),
  errorlogController.getErrorLogs
);
router.post(
  '/GetErrorLogLazyLoad',
  validator.body(errorlogValidation.getErrorLogLazyLoad),
  errorlogController.getErrorLogLazyLoad
);
router.get(
  '/GetErrorLogDetail',
  validator.query(errorlogValidation.getErrorLogDetail),
  errorlogController.getErrorLogDetail
);
router.post(
  '/AddErrorLog',
  validator.body(errorlogValidation.addErrorLog),
  errorlogController.addErrorLog
);
module.exports = router;
