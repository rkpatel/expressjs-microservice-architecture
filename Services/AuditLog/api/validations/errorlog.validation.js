/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  getErrorLogDetail: Joi.object().keys({
    errorLogId: Joi.number().integer().required().empty().messages({
      'number.base'  : `errorLogId should be a type of 'number'`,
      'number.empty' : `errorLogId cannot be an empty field`,
      'any.required' : `errorLogId is a required query string`
    })
  }),
  getErrorLogs        : customJoi.object({}),
  getErrorLogLazyLoad : Joi.object({
    searchText: Joi.string().optional().allow('').messages({
      'string.base': `searchText should be a type of 'text'`
    }),
    first: Joi.number().optional().messages({
      'number.base': `first should be a type of 'number'`
    }),
    rows: Joi.number().optional().messages({
      'number.base': `rows should be a type of 'number'`
    }),
    sortField: Joi.string().required().empty().messages({
      'string.base'  : `sortField should be a type of 'string'`,
      'string.empty' : `sortField cannot be an empty field`,
      'any.required' : `sortField is a required field`
    }),
    sortOrder: Joi.string().required().empty().messages({
      'string.base'  : `sortOrder should be a type of 'string'`,
      'string.empty' : `sortOrder cannot be an empty field`,
      'any.required' : `sortOrder is a required field`
    }),
    parameters: Joi.array().messages({
      'object.base': `parameters should be a type of 'array'`
    }),
    filters: Joi.object().messages({
      'object.base': `filters should be a type of 'object'`
    })
  }),
  addErrorLog: customJoi.object({})
};
