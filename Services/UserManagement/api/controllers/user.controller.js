const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
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
  hashPassword
} = require('../../../../CommonLibrary/api/helpers/auth.helper');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');
const {
  encryptQueryString,
  decryptQueryString
} = require('../../../../CommonLibrary/api/helpers/common.helper');
const {
  NOTIFICATION_ENTITIES
} = require('../../../../CommonLibrary/api/constants/enums');
const {
  getSecretKey
} = require('../../../../CommonLibrary/api/helpers/azureKeyVault.helper');
const {
  SECRET_KEYS
} = require('../../../../CommonLibrary/api/constants/secretManagerKeys');
const {
  validateReCaptcha
} = require('../../../../CommonLibrary/api/helpers/reCaptcha.helper');

const getExecutionPath = methodName => `${__filename}\\${methodName}`;
const getSortBy = async sortColumn => {
  let sortby = '';
  if (sortColumn === 'lastName') {
    sortby = 'LastName';
  } else if (sortColumn === 'userName') {
    sortby = 'UserName';
  } else if (sortColumn === 'email') {
    sortby = 'EmailID';
  } else if (sortColumn === 'status') {
    sortby = 'IsActive';
  } else if (sortColumn === 'dateCreated') {
    sortby = 'CreatedDate';
  } else {
    sortby = 'FirstName';
  }
  return sortby;
};

const validateCaptchaResponse = async captchaResponse => {
  if (process.env.NODE_ENV !== 'local') {
    const isCaptchaValid = await validateReCaptcha(captchaResponse);
    if (!isCaptchaValid) {
      return next(new UnAuthorized(commonMessages.INVALID_CAPTCHA));
    }
  }
  return captchaResponse;
};

module.exports = {
  getAllUsersListing: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('getAllUsersListing'));
    const {
      firstName,
      lastName,
      email,
      userName,
      status,
      globalSearchText,
      sortColumn,
      sortOrder,
      pageIndex,
      pageSize
    } = req.body;
    let sortby = '';
    if (sortColumn) {
      sortby = await getSortBy(sortColumn);
    }
    const statusvalue = !status.includes('Inactive');
    const users = await prisma.User.findMany({
      skip : (pageIndex - 1) * pageSize,
      take : pageSize,
      where:
        globalSearchText && globalSearchText !== ''
          ? {
            OR: [
              { FirstName: { contains: globalSearchText } },
              { LastName: { contains: globalSearchText } },
              { EmailID: { contains: globalSearchText } },
              { UserName: { contains: globalSearchText } },
              {
                RoleMaster: {
                  Name: {
                    contains: globalSearchText
                  }
                }
              }
            ]
          }
          : {
            AND: [
              { FirstName: { contains: firstName } },
              { LastName: { contains: lastName } },
              { EmailID: { contains: email } },
              { UserName: { contains: userName } },
              { IsActive: statusvalue }
            ]
          },
      include: {
        RoleMaster: {
          select: {
            Name: true
          }
        }
      },
      orderBy:
        sortColumn === 'roleName'
          ? {
            RoleMaster: {
              Name: sortOrder.toLowerCase()
            }
          }
          : {
            [sortby]: sortOrder.toLowerCase()
          }
    });
    const userCount = await prisma.User.count({
      where:
        globalSearchText && globalSearchText !== ''
          ? {
            OR: [
              { FirstName: { contains: globalSearchText } },
              { LastName: { contains: globalSearchText } },
              { EmailID: { contains: globalSearchText } },
              { UserName: { contains: globalSearchText } },
              {
                RoleMaster: {
                  Name: {
                    contains: globalSearchText
                  }
                }
              }
            ]
          }
          : {
            AND: [
              { FirstName: { contains: firstName } },
              { LastName: { contains: lastName } },
              { EmailID: { contains: email } },
              { UserName: { contains: userName } },
              { IsActive: statusvalue }
            ]
          }
    });
    if (users) {
      const usersData = [];
      users.forEach(user => {
        usersData.push({
          userId       : user.Id,
          userName     : user.UserName,
          dateCreated  : user.CreatedDate,
          name         : user.UserName,
          firstName    : user.FirstName,
          lastName     : user.LastName,
          email        : user.EmailID,
          dateModified : user.ModifiedDate,
          status       : user.IsActive ? 'Active' : 'Inactive',
          roleId       : user.RoleId,
          roleName     : user.RoleMaster?.Name,
          isActive     : user.IsActive
        });
      });
      const responseData = {
        lstUserListingModel : usersData,
        totalRecords        : userCount,
        lstStatus           : ['Active', 'Inactive']
      };
      return next(
        new GeneralResponse(
          messages.GET_USERS,
          responseData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  }),
  userSignUp: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('userSignUp'));

    const {
      userName,
      firstName,
      lastName,
      email,
      password,
      captchaResponse,
      clientAppUrl,
      createdBy,
      roleId
    } = req.body;

    // Validate captchaResponse
    if (process.env.NODE_ENV !== 'local') {
      const captchaSecretKey = await getSecretKey(
        SECRET_KEYS.CAPTCHA_SECRET_KEY
      );
      const isCaptchaValid = await validateReCaptcha(
        captchaResponse,
        captchaSecretKey
      );
      if (!isCaptchaValid) {
        next(new UnAuthorized(messages.INVALID_CAPTCHA));
      }
    }

    const user = await prisma.User.findFirst({ where: { EmailID: email } });

    if (!user) {
      const hashedPassword = await hashPassword(password);

      await prisma.User.create({
        data: {
          UserName    : userName,
          FirstName   : firstName,
          LastName    : lastName,
          EmailID     : email,
          Password    : hashedPassword,
          RoleId      : roleId,
          CreatedBy   : createdBy,
          CreatedDate : new Date(getDateUTC())
        }
      });

      // Generate User Activation Link if user registrered successfully
      const userActivationUrlPart = await getSecretKey(
        SECRET_KEYS.USER_ACTIVATION_URL
      );
      const encryptedString = await encryptQueryString(email);
      const userActivationUrl = `${userActivationUrlPart}/${encryptedString}`;
      console.log('userActivationUrl', userActivationUrl);

      // email notification payload
      const notificationDetails = {
        notificationEntity : NOTIFICATION_ENTITIES.USER_ACTIVATION,
        recipientEmail     : email,
        message            : messages.SIGNUP_ACTIVATION_LINK_SENT,
        userActivationUrl
      };

      next(
        new GeneralResponse(
          messages.SIGNUP_SUCCESS,
          notificationDetails,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    } else {
      next(new BadRequest(commonMessages.USER_EXISTS));
    }
  }),

  activateUser: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('activateUser'));

    const { email } = req.body;

    const decryptedEmail = await decryptQueryString(email);

    // Find user using decrypted Email
    const user = await prisma.User.findFirst({
      where: { EmailID: decryptedEmail }
    });

    if (user) {
      if (!user.IsActive) {
        // Activate user
        await prisma.User.update({
          where: {
            Id: user.Id
          },
          data: {
            IsActive     : true,
            ModifiedBy   : user.Id,
            ModifiedDate : new Date(getDateUTC())
          }
        });
        return next(
          new GeneralResponse(
            messages.USER_ACTIVATION_SUCCESS,
            null,
            httpStatusCode.HTTP_SUCCESS
          )
        );
      }
      return next(
        new GeneralResponse(
          messages.USER_ALREADY_ACTIVE,
          null,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(commonMessages.USER_NOT_FOUND));
  }),

  addEditUser: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('addEditUser'));
    const {
      captchaResponse,
      createdBy,
      email,
      firstName,
      lastName,
      password,
      roleId,
      userName,
      isActive,
      userId,
      isVerified
    } = req.body;
    let responseData;
    let responseMessage;

    // Validate captchaResponse
    await validateCaptchaResponse(captchaResponse);

    const emailExist = await prisma.User.count({
      where: {
        EmailID : email,
        NOT     : {
          Id: userId
        }
      }
    });

    if (emailExist > 0) {
      return next(new BadRequest(messages.EMAIL_ALREADY_EXIST));
    }

    const userDetails = {
      FirstName  : firstName,
      LastName   : lastName,
      EmailID    : email,
      UserName   : userName,
      IsActive   : isActive,
      IsVerified : isVerified || false,
      RoleId     : roleId
    };

    /**
     * userId = 0 : Add User
     * userId > 0 : Update User
     */
    if (userId === 0) {
      await prisma.User.create({
        data: {
          ...userDetails,
          Password              : password ? await hashPassword(password) : null,
          CreatedBy             : createdBy || req.token.UserId,
          CreatedDate           : new Date(getDateUTC()),
          PasswordResetDuration : new Date(getDateUTC())
        }
      });

      // Generate reset password URL once user get added
      const resetPasswordUrlPart = await getSecretKey(
        SECRET_KEYS.RESET_PASSWORD_URL
      );
      const encryptedString = await encryptQueryString(email);
      const resetPasswordUrl = `${resetPasswordUrlPart}/${encryptedString}`;
      console.log('resetPasswordUrl', resetPasswordUrl);

      // Email notification Details
      responseData = {
        notificationEntity : NOTIFICATION_ENTITIES.USER_REGISTRATION,
        recipientEmail     : email,
        recipientUserName  : userName,
        message            : messages.ADD_USER_CREDENTIAL_LINK_SENT,
        resetPasswordUrl
      };

      responseMessage = messages.ADD_USER_SUCCESS;
    } else if (userId > 0) {
      const userExist = await prisma.User.count({
        where: { Id: userId }
      });

      if (userExist === 0) {
        return next(new BadRequest(messages.USER_NOT_FOUND));
      }
      await prisma.User.update({
        where: {
          Id: userId
        },
        data: {
          ...userDetails,
          Password     : password ? await hashPassword(password) : undefined,
          ModifiedBy   : req.token.UserId,
          ModifiedDate : new Date(getDateUTC())
        }
      });
      const updatedUserData = await prisma.User.findFirst({
        where: { Id: userId }
      });
      if (updatedUserData) {
        const updatedUser = {};
        Object.keys(updatedUserData).forEach((key, index) => {
          const newKey = key.charAt(0).toLowerCase() + key.slice(1);
          updatedUser[newKey] = updatedUserData[key];
        });
        responseData = updatedUser;
      }
      responseMessage = messages.UPDATE_USER_SUCCESS;
    }

    return next(
      new GeneralResponse(
        responseMessage,
        responseData,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  }),
  deleteUsers: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('deleteUsers'));
    const { userIds } = req.body;
    if (userIds && userIds.length > 0) {
      await prisma.User.deleteMany({
        where: {
          Id: {
            in: userIds
          }
        }
      });
      return next(
        new GeneralResponse(
          messages.DELETE_USER_SUCCESS,
          null,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.DELETE_USER_NOT_FOUND));
  }),
  getUserById: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('getUserById'));
    const { userId } = req.body;
    const user = await prisma.User.findFirst({
      where: { Id: userId }
    });
    if (user) {
      const responseData = {
        userId       : user.Id,
        userName     : user.UserName,
        dateCreated  : user.CreatedDate,
        name         : user.UserName,
        firstName    : user.FirstName,
        lastName     : user.LastName,
        email        : user.EmailID,
        dateModified : user.ModifiedDate,
        status       : user.IsActive ? 'Active' : 'Inactive',
        roleId       : user.RoleId,
        isActive     : user.IsActive
      };
      return next(
        new GeneralResponse(
          messages.GET_RECORD,
          responseData,
          httpStatusCode.HTTP_SUCCESS
        )
      );
    }
    return next(new BadRequest(messages.NO_RECORD_FOUND));
  })
};
