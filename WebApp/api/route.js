const express = require('express');

const router = express.Router();
const identityService = require('./apiservices/identityService');
const userManagementService = require('./apiservices/userManagementService');
const roleService = require('./apiservices/roleService');
const notificationService = require('./apiservices/notificationService');
const auditlogService = require('./apiservices/auditlogService');

router.use((req, res, next) => {
  console.log('Called Api: ', req.path);
  next();
});

router.use(identityService);
router.use(userManagementService);
router.use(roleService);
router.use(notificationService);
router.use(auditlogService);
module.exports = router;
