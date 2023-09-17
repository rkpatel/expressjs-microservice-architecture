const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const { SECRET_KEYS } = require('../constants/secretManagerKeys');
const { getSecretKey } = require('./azureKeyVault.helper');

module.exports = {
  sendGridMail: async (to, cc, subject, content, { fileName, type }) => {
    sgMail.setApiKey(await getSecretKey(SECRET_KEYS.SENDGRID_API_KEY));
    let emailDetails;
    const sendGridFromEmail = await getSecretKey(
      SECRET_KEYS.SENDGRID_FROM_EMAIL
    );
    const sendGridFromName = await getSecretKey(SECRET_KEYS.SENDGRID_FROM_NAME);
    if (fileName !== undefined && type !== undefined) {
      emailDetails = {
        to,
        cc,
        from        : { email: sendGridFromEmail, name: sendGridFromName },
        subject,
        html        : content,
        attachments : [
          {
            content: fs
              .readFileSync(`${process.cwd()}/assets/images/${fileName}`)
              .toString('base64'),
            filename    : fileName,
            type,
            disposition : 'attachment'
          }
        ]
      };
    } else {
      emailDetails = {
        to,
        cc,
        from : { email: sendGridFromEmail, name: sendGridFromName },
        subject,
        html : content
      };
    }
    if (process.env.NODE_ENV !== 'local') {
      sgMail
        .send(emailDetails)
        .then(() => {
          console.log('Email sent');
          if (fileName !== undefined && type !== undefined) {
            fs.unlinkSync(`${process.cwd()}/assets/images/${fileName}`);
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    } else {
      console.log('Mails are disabled for Local Environment');
    }
  }
};
