const { PrismaClient } = require('@prisma/client');
const {
  GeneralResponse
} = require('../../../../CommonLibrary/api/utils/response');
const { GeneralError } = require('../../../../CommonLibrary/api/utils/error');
const httpStatusCode = require('../../../../CommonLibrary/api/utils/httpStatusCode');
const {
  NOTIFICATION_ENTITIES
} = require('../../../../CommonLibrary/api/constants/enums');
const {
  catchAsync
} = require('../../../../CommonLibrary/api/helpers/error.helper');
const { NOTIFICATION_TYPE } = require('../constants/enums');
const messages = require('../constants/message');
const resetPassword = require('../notifications/Email/resetPassword');
const userActivation = require('../notifications/Email/userActivation');
const userRegistration = require('../notifications/Email/userRegistration');

const prisma = new PrismaClient();

const getExecutionPath = methodName => `${__filename}\\${methodName}`;
const findTemplate = async (name, type) => {
  const template = await prisma.NotificationTemplate.findFirst({
    where: {
      Name : name,
      Type : type
    }
  });
  return (
    template || next(new GeneralError(messages.NOTIFICATION_TEMPLATE_NOT_FOUND))
  );
};

module.exports = {
  sendNotification: catchAsync(async (req, res, next) => {
    res.setHeader('executionpath', getExecutionPath('sendNotification'));

    const { notificationEntity, message } = req.body;
    let responseMessage = messages.SEND_NOTIFICATION_SUCCESS;

    switch (notificationEntity) {
      case NOTIFICATION_ENTITIES.RESET_PASSWORD: {
        const template = await findTemplate(
          NOTIFICATION_ENTITIES.RESET_PASSWORD,
          NOTIFICATION_TYPE.EMAIL
        );
        await resetPassword(template, req, res);
        responseMessage = message || responseMessage;
        break;
      }
      case NOTIFICATION_ENTITIES.USER_ACTIVATION: {
        const template = await findTemplate(
          NOTIFICATION_ENTITIES.USER_ACTIVATION,
          NOTIFICATION_TYPE.EMAIL
        );
        await userActivation(template, req, res);
        responseMessage = message || responseMessage;
        break;
      }
      case NOTIFICATION_ENTITIES.USER_REGISTRATION: {
        const template = await findTemplate(
          NOTIFICATION_ENTITIES.USER_REGISTRATION,
          NOTIFICATION_TYPE.EMAIL
        );
        await userRegistration(template, req, res);
        responseMessage = message || responseMessage;
        break;
      }
      default:
        next(new GeneralError(messages.NOTIFICATION_ENTITY_NOT_FOUND));
    }
    next(
      new GeneralResponse(
        responseMessage,
        null,
        httpStatusCode.HTTP_SUCCESS
      )
    );
  })
};
