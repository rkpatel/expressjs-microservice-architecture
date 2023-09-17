/* eslint-disable newline-per-chained-call */
const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  authenticateUser: customJoi.object({
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`
    }),
    password: Joi.string().required().empty().messages({
      'string.base'  : `password should be a type of 'text'`,
      'string.empty' : `password cannot be an empty field`,
      'any.required' : `password is a required field`
    }),
    type: Joi.string().optional().allow('').messages({
      'string.base'  : `type field should be a type of 'text'`,
      'string.empty' : `type cannot be an empty field`
    }),
    ipAddress: Joi.string().optional().allow('').messages({
      'string.base'  : `ipAddress field should be a type of 'text'`,
      'string.empty' : `ipAddress cannot be an empty field`
    }),
    captchaResponse: Joi.string().required().allow('').messages({
      'string.base'  : `captchaResponse should be a type of 'text'`,
      'string.empty' : `captchaResponse cannot be an empty field`
    })
  }),
  updateNewPassword: customJoi.object({
    email: Joi.string().required().empty().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'any.required' : `email is a required field`
    }),
    newPassword: Joi.string().required().empty().messages({
      'string.base'  : `newPassword should be a type of 'text'`,
      'string.empty' : `newPassword cannot be an empty field`,
      'any.required' : `newPassword is a required field`
    })
  }),

  sendForgotPasswordEmail: Joi.object({
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`
    }),
    clientAppUrl: Joi.string().required().empty().messages({
      'string.base'  : `clientAppUrl should be a type of 'text'`,
      'string.empty' : `clientAppUrl cannot be an empty field`,
      'any.required' : `clientAppUrl is a required field`
    })
  }),

  verifyResetPasswordLink: customJoi.object({
    encyptLink: Joi.string().required().empty().messages({
      'string.base'  : `encyptLink should be a type of 'text'`,
      'string.empty' : `encyptLink cannot be an empty field`,
      'any.required' : `encyptLink is a required field`
    })
  })
};
