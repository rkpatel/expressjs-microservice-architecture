const express = require('express');

const router = express.Router();
const {
  validator
} = require('../../../CommonLibrary/api/helpers/validator.helper');
const userController = require('./controllers/user.controller');
const userValidation = require('./validations/user.validation');
const roleController = require('./controllers/role.controller');
const roleValidation = require('./validations/role.validation');
const {
  authenticate
} = require('../../../CommonLibrary/api/helpers/auth.helper');

/* User routes */
router.post(
  '/GetAllUsersListing',
  validator.body(userValidation.getAllUsersListing),
  authenticate,
  userController.getAllUsersListing
);
router.post(
  '/UserSignUp',
  validator.body(userValidation.userSignUp),
  userController.userSignUp
);
router.post(
  '/ActivateUser',
  validator.body(userValidation.activateUser),
  userController.activateUser
);
router.post(
  '/DeleteUsers',
  validator.body(userValidation.deleteUsers),
  authenticate,
  userController.deleteUsers
);
router.post(
  '/AddEditUser',
  validator.body(userValidation.addEditUser),
  authenticate,
  userController.addEditUser
);
router.post(
  '/GetUserById',
  validator.body(userValidation.getUserById),
  authenticate,
  userController.getUserById
);

router.get(
  '/GetRoleDetailByRoleId',
  validator.query(roleValidation.getRoleDetailByRoleId),
  authenticate,
  roleController.getRoleDetailByRoleId
);
router.post(
  '/AddEditRoleDetail',
  validator.body(roleValidation.addEditRoleDetail),
  authenticate,
  roleController.addEditRoleDetail
);
router.post(
  '/GetAllRoleListing',
  validator.body(roleValidation.getAllRoleListing),
  authenticate,
  roleController.getAllRoleListing
);
router.get(
  '/GetAllActiveRoles',
  validator.body(roleValidation.getAllActiveRoles),
  authenticate,
  roleController.getAllActiveRoles
);
router.put(
  '/UpdateRoleStatus',
  validator.body(roleValidation.updateRoleStatus),
  authenticate,
  roleController.updateRoleStatus
);

module.exports = router;
