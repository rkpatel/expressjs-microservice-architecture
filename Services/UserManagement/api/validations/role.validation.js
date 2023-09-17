/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
const Joi = require('joi');
const { STATUS } = require('../../../../CommonLibrary/api/constants/enums');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  getRoleDetailByRoleId: Joi.object().keys({
    roleId: Joi.number().integer().required().empty().messages({
      'number.base'  : `roleId should be a type of 'number'`,
      'number.empty' : `roleId cannot be an empty field`,
      'any.required' : `roleId is a required query string`
    })
  }),
  addEditRoleDetail: Joi.object({
    roleDetail: Joi.object().messages({
      'object.base': `roleDetail should be a type of 'object'`
    }),
    permission: Joi.array().required().messages({
      'object.base': `permission should be a type of 'array'`
    })
  }),
  getAllRoleListing: Joi.object({
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
  getAllActiveRoles : Joi.object({}),
  updateRoleStatus  : Joi.object({
    roleId: Joi.number().required().empty().messages({
      'number.base'  : `roleId should be a type of 'number'`,
      'number.empty' : `roleId cannot be an empty field`,
      'any.required' : `roleId is a required field`
    }),
    status: Joi.string().required().valid(STATUS.ACTIVE, STATUS.INACTIVE)
  })
};
