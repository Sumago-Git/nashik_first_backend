// // utils/email.js
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or use "smtp" if you're using an SMTP server
//   auth: {
//     user: process.env.EMAIL_USER, // Your email address
//     pass: process.env.EMAIL_PASS, // Your email password or app-specific password
//     // pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
//   },
// });

// const sendEmail = async (to, subject, text, html) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//     html,
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;


// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.nashikfirst.com", // Your SMTP server hostname
  port: 587, // Port for SMTP (587 for TLS)
  secure: false, // Use `true` for port 465, `false` for port 587
  auth: {
    user: process.env.EMAIL_USER, // Your SMTP username (email)
    pass: process.env.EMAIL_PASS, // Your SMTP password
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates (optional, based on your server)
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Your sender email address
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
