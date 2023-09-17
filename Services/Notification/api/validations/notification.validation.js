const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  sendNotification: customJoi.object().keys({
    notificationEntity : Joi.string().required(),
    message            : Joi.string().optional()
  })
};
