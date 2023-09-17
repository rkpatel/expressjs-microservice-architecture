/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  getAllUsersListing: Joi.object({
    firstName: Joi.string().optional().allow('').messages({
      'string.base': `firstName should be a type of 'text'`
    }),
    lastName: Joi.string().optional().allow('').messages({
      'string.base': `lastName should be a type of 'text'`
    }),
    email: Joi.string().optional().allow('').messages({
      'string.base': `email should be a type of 'text'`
    }),
    userName: Joi.string().optional().allow('').messages({
      'string.base': `userName should be a type of 'text'`
    }),
    status: Joi.array().optional().messages({
      'array.base': `status should be a type of 'array'`
    }),
    dateModified: Joi.string().optional().allow('').messages({
      'string.base': `Date Modified should be a type of 'text'`
    }),
    userId: Joi.number().optional().messages({
      'number.base': `userId should be a type of 'number'`
    }),
    name: Joi.string().optional().allow('').messages({
      'string.base': `name should be a type of 'text'`
    }),
    dateCreated: Joi.string().optional().allow('').messages({
      'string.base': `dateCreated should be a type of 'text'`
    }),
    globalSearchText: Joi.string().optional().allow('').messages({
      'string.base': `globalSearchText should be a type of 'text'`
    }),
    rowCount: Joi.number().optional().messages({
      'number.base': `rowCount should be a type of 'number'`
    }),
    sortColumn: Joi.string().required().empty().messages({
      'string.base'  : `sortColumn should be a type of 'string'`,
      'string.empty' : `sortColumn cannot be an empty field`,
      'any.required' : `sortColumn is a required field`
    }),
    sortOrder: Joi.string().required().empty().messages({
      'string.base'  : `sortOrder should be a type of 'string'`,
      'string.empty' : `sortOrder cannot be an empty field`,
      'any.required' : `sortOrder is a required field`
    }),
    pageIndex: Joi.number().required().empty().messages({
      'number.base'  : `pageIndex should be a type of 'number'`,
      'number.empty' : `pageIndex cannot be an empty field`,
      'any.required' : `pageIndex is a required field`
    }),
    pageSize: Joi.number().required().empty().messages({
      'number.base'  : `pageSize should be a type of 'number'`,
      'number.empty' : `pageSize cannot be an empty field`,
      'any.required' : `pageSize is a required field`
    })
  }),

  userSignUp: Joi.object({
    userId: Joi.number().optional().allow('').messages({
      'string.base': `userId should be a type of 'text'`
    }),
    captchaResponse: Joi.string().required().empty().messages({
      'string.base'  : `captchaResponse should be a type of 'string'`,
      'string.empty' : `captchaResponse cannot be an empty field`,
      'any.required' : `captchaResponse is a required field`
    }),
    clientAppUrl: Joi.string().required().empty().messages({
      'string.base'  : `clientAppUrl should be a type of 'string'`,
      'string.empty' : `clientAppUrl cannot be an empty field`,
      'any.required' : `clientAppUrl is a required field`
    }),
    createdBy: Joi.number().required().empty().messages({
      'number.base'  : `createdBy should be a type of 'number'`,
      'number.empty' : `createdBy cannot be an empty field`,
      'any.required' : `createdBy is a required field`
    }),
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`
    }),
    firstName: Joi.string().required().empty().messages({
      'string.base'  : `firstName should be a type of 'text'`,
      'string.empty' : `firstName cannot be an empty field`,
      'any.required' : `firstName is a required field`
    }),
    lastName: Joi.string().required().empty().messages({
      'string.base'  : `lastName should be a type of 'text'`,
      'string.empty' : `lastName cannot be an empty field`,
      'any.required' : `lastName is a required field`
    }),
    password: Joi.string().required().empty()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).min(8).max(16).messages({
      'string.base'         : `password should be a type of 'text'`,
      'string.empty'        : `password cannot be an empty field`,
      'string.min'          : `password should be of minimum 8 characters`,
      'string.max'          : `password should be of maximum 16 characters`,
      'string.pattern.base' : `password must contains at least one uppercase letter, one lowercase letter, one number and one special character`,
      'any.required'        : `password is a required field`
    }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).optional().messages({
      'string.empty' : `confirmPassword cannot be an empty field`,
      'string.valid' : `confirm password should match password`
    }),
    roleId: Joi.number().required().empty().messages({
      'number.base'  : `roleId should be a type of 'number'`,
      'number.empty' : `roleId cannot be an empty field`,
      'any.required' : `roleId is a required field`
    }),
    userName: Joi.string().required().messages({
      'string.base'  : `userName should be a type of 'text'`,
      'any.required' : `userName is a required field`
    }),
    isActive: Joi.boolean().optional()
  }),

  activateUser: customJoi.object({
    email: Joi.string().required().empty().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'any.required' : `email is a required field`
    })
  }),

  addEditUser: Joi.object({
    captchaResponse: Joi.string().required().empty().messages({
      'string.base'  : `captchaResponse should be a type of 'string'`,
      'string.empty' : `captchaResponse cannot be an empty field`,
      'any.required' : `captchaResponse is a required field`
    }),
    clientAppUrl: Joi.string().optional().empty().messages({
      'string.base'  : `clientAppUrl should be a type of 'string'`,
      'string.empty' : `clientAppUrl cannot be an empty field`
    }),
    createdBy: Joi.number().optional().allow(null).messages({
      'number.base': `createdBy should be a type of 'number'`
    }),
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`
    }),
    firstName: Joi.string().required().empty().messages({
      'string.base'  : `firstName should be a type of 'text'`,
      'string.empty' : `firstName cannot be an empty field`,
      'any.required' : `firstName is a required field`
    }),
    lastName: Joi.string().required().empty().messages({
      'string.base'  : `lastName should be a type of 'text'`,
      'string.empty' : `lastName cannot be an empty field`,
      'any.required' : `lastName is a required field`
    }),
    userId: Joi.number().required().empty().messages({
      'number.base'  : `userId should be a type of 'number'`,
      'number.empty' : `userId cannot be an empty field`,
      'any.required' : `userId is a required field`
    }),
    password: Joi.alternatives().conditional('userId', {
      is        : 0,
      then      : Joi.string().optional().allow(null),
      otherwise : Joi.string().required().empty().allow(null)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).min(8).max(16).messages({
        'string.base'         : `password should be a type of 'text'`,
        'string.empty'        : `password cannot be an empty field`,
        'string.min'          : `password should be of minimum 8 characters`,
        'string.max'          : `password should be of maximum 16 characters`,
        'string.pattern.base' : `password must contains at least one uppercase letter, one lowercase letter, one number and one special character`,
        'any.required'        : `password is a required field`
      })
    }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).optional().messages({
      'string.empty' : `confirmPassword cannot be an empty field`,
      'string.valid' : `confirm password should match password`
    }),
    roleId: Joi.number().required().empty().messages({
      'number.base'  : `roleId should be a type of 'number'`,
      'number.empty' : `roleId cannot be an empty field`,
      'any.required' : `roleId is a required field`
    }),
    userName: Joi.string().required().alphanum().messages({
      'string.base'     : `userName should be a type of 'text'`,
      'string.alphanum' : `userName can only contain alphanumeric characters`,
      'any.required'    : `userName is a required field`
    }),
    isActive: Joi.boolean().required().messages({
      'boolean.base'  : `isActive should be a type of 'boolean'`,
      'boolean.empty' : `isActive cannot be an empty field`
    }),
    isVerified: Joi.boolean().optional().messages({
      'boolean.base'  : `isVerified should be a type of 'boolean'`,
      'boolean.empty' : `isVerified cannot be an empty field`
    })
  }),
  deleteUsers: Joi.object({
    userIds: Joi.array().required().messages({
      'array.base'  : `userIds should be a type of 'array'`,
      'array.empty' : `userIds canot be an empty field`
    })
  }),
  getUserById: Joi.object({
    userId: Joi.number().required().empty().messages({
      'number.base'  : `userId should be a type of 'number'`,
      'number.empty' : `userId cannot be an empty field`,
      'any.required' : `userId is a required field`
    })
  })
};
