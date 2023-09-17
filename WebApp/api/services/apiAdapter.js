/* eslint-disable consistent-return */
const axios = require('axios');

module.exports = {
  apiAdapter: async (req, res, method, path, returnResponse = false, payload = '') => {
    try {
      const options = {
        method,
        headers : { 'content-type': 'application/json', Authorization: req.headers.authorization },
        data    : payload !== '' ? payload : req.body,
        url     : path
      };
      const resp = await axios(options);
      res.executionpath = resp.headers.executionpath;
      return (returnResponse ? {
        responseStatus : resp.status,
        responseData   : resp.data
      }
      : res.status(resp.status).send(resp.data)
      );
    } catch (error) {
      if (error.response) {
        res.executionpath = error.response.headers?.executionpath;
        res.error = error.response?.data?.errorDetails;
        const responseData = error.response.data;
        delete responseData?.errorDetails;
        res.status(error.response.status).send(responseData);
      } else {
        throw error;
      }
    }
  }
};
