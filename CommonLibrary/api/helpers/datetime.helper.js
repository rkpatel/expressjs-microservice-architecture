const moment = require('moment');

module.exports = {
  getCurrentDateTime: () => moment().format('YYYY-MM-DD hh:mm:ss'),

  getDateUTC: () => moment().utc().format('YYYY-MM-DD HH:mm:ss'),

  getFormatDateUTC: (format) => moment().utc().format(format),

  formatDate: (date, format) => {
    if (format && date) {
      return moment(date).format(format);
    }
    return '';
  }
};
