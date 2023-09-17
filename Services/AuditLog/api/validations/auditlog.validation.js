/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
const Joi = require('joi');

const customJoi = Joi.defaults(schema => schema.options({
  allowUnknown: true
}));

module.exports = {
  addAuditLog             : customJoi.object({}),
  getAllAuditTrailListing : Joi.object({})
};
