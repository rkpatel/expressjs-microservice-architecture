const express = require('express');
const { getSecretKey } = require('../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const { SECRET_KEYS } = require('../../../CommonLibrary/api/constants/secretManagerKeys');
const { apiAdapter } = require('../services/apiAdapter');
const { catchAsync } = require('../../../CommonLibrary/api/helpers/error.helper');

const router = express.Router();

const getRoleManagementServiceURL = async reqPath => {
  const updatedReqPath = reqPath.replace(/RoleManagement/g, 'UserManagement');
  const baseURL = await getSecretKey(SECRET_KEYS.USER_MANAGEMENT_SERVICE_URL);
  return (baseURL + updatedReqPath);
};

router.get('/RoleManagement/GetRoleDetailByRoleId', catchAsync(async (req, res) => {
  const completeReqURL = await getRoleManagementServiceURL(req.url);
  await apiAdapter(req, res, 'GET', completeReqURL);
}));

router.post('/RoleManagement/AddEditRoleDetail', catchAsync(async (req, res) => {
  const completeReqURL = await getRoleManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.post('/RoleManagement/GetAllRoleListing', catchAsync(async (req, res) => {
  const completeReqURL = await getRoleManagementServiceURL(req.path);
  await apiAdapter(req, res, 'POST', completeReqURL);
}));

router.get('/RoleManagement/GetAllActiveRoles', catchAsync(async (req, res) => {
  const completeReqURL = await getRoleManagementServiceURL(req.path);
  await apiAdapter(req, res, 'GET', completeReqURL);
}));

router.put('/RoleManagement/UpdateRoleStatus', catchAsync(async (req, res) => {
  const completeReqURL = await getRoleManagementServiceURL(req.path);
  await apiAdapter(req, res, 'PUT', completeReqURL);
}));

module.exports = router;
