const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const {
  generateToken,
  hashPassword,
  comparePassword
} = require('../../../../CommonLibrary/api/helpers/auth.helper');
const {
  GeneralResponse
} = require('../../../../CommonLibrary/api/utils/response');
const {
  UnAuthorized,
  BadRequest
} = require('../../../../CommonLibrary/api/utils/error');
const httpStatusCode = require('../../../../CommonLibrary/api/utils/httpStatusCode');
const messages = require('../constants/message');
const commonMessages = require('../../../../CommonLibrary/api/constants/message');
const {
  getDateUTC
} = require('../../../../CommonLibrary/api/helpers/datetime.helper');
const {
  validateReCaptcha
} = require('../../../../CommonLibrary/api/helpers/reCaptcha.helper');
const { JWT_TOKEN } = require('../constants/enums');
const {
  getSecretKey
} = require('../../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const {
  SECRET_KEYS
} = require('../../../../CommonLibrary/api/constants/secretManagerKeys');
const {
  encryptQueryString,
  decryptQueryString
} = require('../../../../CommonLibrary/api/helpers/common.helper');
const {
  NOTIFICATION_ENTITIES
} = require('../../../../CommonLibrary/api/constants/enums');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');

const getExecutionPath = methodName => `${__filename}\\${methodName}`;

const getPermissionList = async moduleData => {
  const roleWisePermissionData = await prisma.$queryRaw`SELECT DISTINCT RP.PermissionId, 
    PM.Name as PermissionName
    FROM RolePermission as RP
    LEFT JOIN PermissionMaster as PM ON PM.Id = RP.PermissionId
    WHERE RP.RoleId = ${moduleData.RoleId} 
    AND RP.ModuleId = ${moduleData.ModuleId} AND RP.Permission = 'true'`;

  return roleWisePermissionData?.map(
    item => `Can${moduleData.ModuleName}${item.PermissionName}`
  );
};

const getSubModuleList = async (roleWiseModuleData, mainModuleName) => {
  let filteredArray = roleWiseModuleData.filter(
    item => item.MainModuleName === mainModuleName
  );

  filteredArray = await Promise.all(
    filteredArray?.map(async item => {
      const subModule = {
        subModuleName        : item.ModuleName,
        url                  : item.URL,
        subModuleProductType : null,
        isParentMenu         : item.IsParentMenu ? item.IsParentMenu : false,
        menuIconClass        : item.MenuIconClass,
        permissionList       : await getPermissionList(item),
        subModuleDisplayName : item.ModuleDisplayName
      };
      return subModule;
    })
  );
  return filteredArray;
};

const getRoleWiseModuleData = async roleId => {
  const roleWiseModuleData = await prisma.$queryRaw`SELECT DISTINCT RP.RoleId, 
      RP.ModuleId, MM.Name as ModuleName,
      MM.DisplayName as ModuleDisplayName, 
      MM.ParentId, MM.Url as 'URL', MM1.Name as MainModuleName, MM1.ParentId as MainModuleParentId,
      MM1.Url as MainModuleURL, MM1.Id as MainModuleId, MM.IsParentMenu as IsParentMenu,
      MM1.IsParentMenu as IsMainModuleParentMenu, MM.MenuIconClass, 
      MM1.MenuIconClass as MainMenuIconClass
      FROM RolePermission as RP
      LEFT JOIN ModuleMaster as MM ON MM.Id = RP.ModuleId
      LEFT JOIN ModuleMaster as MM1 ON MM1.Id = MM.ParentId
      WHERE RP.RoleId = ${roleId} AND MM.IsActive = 'true'`;

  const moduleList = [];
  if (roleWiseModuleData.length > 0) {
    // Reason to disable rule : For-of is restricted in airbnb but it's much faster than forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const item of roleWiseModuleData) {
      const i = moduleList.findIndex(
        x => x.moduleName === item.MainModuleName
      );
      if (i <= -1) {
        moduleList.push({
          moduleName   : item.MainModuleName,
          url          : item.MainModuleURL,
          productType  : item.productType ? item.productType : null,
          isParentMenu : item.IsMainModuleParentMenu
            ? item.IsMainModuleParentMenu
            : false,
          menuIconClass: item.MainMenuIconClass,

          /* eslint-disable no-await-in-loop */
          subModuleList: await getSubModuleList(
            roleWiseModuleData,
            item.MainModuleName
          )
        });
      }
    }
  }
  return moduleList;
};

module.exports = {
  authenticateUser: catchAsync(async (req, res, next) => {
    // set 'executionpath' in response header to use it in auditlog
    res.setHeader('executionpath', getExecutionPath('authenticateUser'));

    const { email, password, captchaResponse } = req.body;

    // Validate captchaResponse
    if (process.env.NODE_ENV !== 'local') {
      const isCaptchaValid = await validateReCaptcha(captchaResponse);
      if (!isCaptchaValid) {
        return next(new UnAuthorized(commonMessages.INVALID_CAPTCHA));
      }
    }

    // Find user using Email Id
    const user = await prisma.User.findFirst({
      where: { EmailID: email }
    });

    if (user) {
      // Check if user account is active or not
      if (!user.IsActive) {
        return next(new BadRequest(commonMessages.INACTIVE_USER));
      }

      // Check if password is valid or not
      const matchPassword = await comparePassword(password, user.Password);

      if (matchPassword) {
        // Generate jwt token
        const userData = {
          jti      : uuidv4(),
          UserId   : user.Id,
          FullName : `${user.FirstName} ${user.LastName}`,
          UserName : user.UserName,
          Email    : user.EmailID,
          iss      : (await getSecretKey(SECRET_KEYS.IDENTITY_SERVICE_URL))?.replace(
            'api/',
            ''
          )
        };
        const tokenExpiryInMin = await getSecretKey(
          SECRET_KEYS.JWT_TOKEN_EXPIRE_TIME_IN_MIN
        );
        const tokenExpiryInSeconds = parseInt(tokenExpiryInMin) * 60;
        const token = await generateToken(userData, `${tokenExpiryInSeconds}s`);

        const moduleList = await getRoleWiseModuleData(user.RoleId);

        const responseData = {
          authenticated : true,
          created       : getDateUTC(),
          expiresIn     : await getSecretKey(
            SECRET_KEYS.JWT_TOKEN_EXPIRE_TIME_IN_MIN
          ),
          accessToken        : token,
          message            : httpStatusCode.SUCCESS,
          tokenType          : JWT_TOKEN.TOKEN_TYPE,
          userId             : user.Id,
          userName           : user.UserName,
          fullName           : `${user.FirstName} ${user.LastName}`,
          email              : user.EmailID,
          isActive           : user.IsActive,
          roleId             : user.RoleId,
          refreshToken       : null,
          roleWisePermission : moduleList ? { moduleList } : null
        };

        return next(
          new GeneralResponse(
            messages.LOGIN_SUCCESS,
            responseData,
            httpStatusCode.HTTP_SUCCESS
          )
        );
      }
      return next(new UnAuthorized(messages.INCORRECT_CREDENTIALS));
    }
    return next(new UnAuthorized(messages.INCORRECT_CREDENTIALS));
  }),

  updateNewPassword: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('updateNewPassword'));

    const { email, newPassword } = req.body;

    const decryptedEmail = await decryptQueryString(email);

    const user = await prisma.User.findFirst({
      where: { EmailID: decryptedEmail }
    });

    if (user) {
      if (!user.PasswordResetDuration) {
        return next(new BadRequest(messages.RESET_PASSWORD_LINK_EXPIRE));
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.User.update({
        where: {
          Id: user.Id
        },
        data: {
          Password              : hashedPassword,
          PasswordResetDuration : null,
          ModifiedBy            : user.Id,
          ModifiedDate          : new Date(getDateUTC())
        }
      });
      return next(
        new GeneralResponse(
          messages.CHANGE_PASSWORD,
          null,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(commonMessages.INVALID_USER));
  }),

  sendForgotPasswordEmail: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('sendForgotPasswordEmail'));

    const { email, clientAppUrl } = req.body;

    const user = await prisma.User.findFirst({
      where: { EmailID: email }
    });

    if (user) {
      await prisma.User.update({
        where: {
          Id: user.Id
        },
        data: {
          PasswordResetDuration : new Date(getDateUTC()),
          ModifiedBy            : user.Id,
          ModifiedDate          : new Date(getDateUTC())
        }
      });

      // Generate reset password URL if user exist
      const resetPasswordUrlPart = await getSecretKey(
        SECRET_KEYS.RESET_PASSWORD_URL
      );
      const encryptedString = await encryptQueryString(email);
      const resetPasswordUrl = `${resetPasswordUrlPart}/${encryptedString}`;
      console.log('resetPasswordUrl', resetPasswordUrl);

      // Email notification payload details
      const notificationDetails = {
        notificationEntity : NOTIFICATION_ENTITIES.RESET_PASSWORD,
        recipientEmail     : user.EmailID,
        resetPasswordURL   : resetPasswordUrl,
        message            : messages.RESET_PASSWORD_LINK_SENT,
        clientAppUrl
      };

      return next(
        new GeneralResponse(
          messages.RESET_PASSWORD_LINK_REQUEST_SENT,
          notificationDetails,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new UnAuthorized(commonMessages.ACCOUNT_NOT_FOUND));
  }),

  verifyResetPasswordLink: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('verifyResetPasswordLink'));

    const { encyptLink } = req.body;

    const decryptedEmail = await decryptQueryString(encyptLink);

    // Find user using decrypted Email
    const user = await prisma.User.findFirst({
      where: { EmailID: decryptedEmail }
    });

    if (user) {
      const passwordResetDuration = user.PasswordResetDuration;
      if (!passwordResetDuration) {
        return next(new BadRequest(messages.RESET_PASSWORD_LINK_EXPIRE));
      }

      const passwordExpiryDate = new Date(passwordResetDuration);
      passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 1);

      // Check if Reset Password Link is expired or not
      if (passwordExpiryDate > passwordResetDuration) {
        return next(
          new GeneralResponse(
            messages.RESET_PASSWORD_LINK_VALID,
            decryptedEmail,
            httpStatusCode.HTTP_SUCCESS
          )
        );
      }
      return next(new BadRequest(messages.RESET_PASSWORD_LINK_EXPIRE));
    }
    return next(new BadRequest(commonMessages.INVALID_USER));
  })
};
