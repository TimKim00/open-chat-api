// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = {
  sendEmail: async function(to, subject, text) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text
    };
    return transport.sendMail(mailOptions);
  },
};
