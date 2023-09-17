const {
  sendGridMail
} = require('../../../../../CommonLibrary/api/helpers/sendGridMail.helper');

module.exports = async (template, req) => {
  const request = req.body;

  const toEmails = request.recipientEmail;
  const ccEmails = request.ccEmails ? request.ccEmails : null;
  const subject = template.Subject;
  let emailBody = template.Body;
  emailBody = emailBody.replace('#link', request.resetPasswordURL);
  const attachments = {};

  await sendGridMail(toEmails, ccEmails, subject, emailBody, attachments);
};
