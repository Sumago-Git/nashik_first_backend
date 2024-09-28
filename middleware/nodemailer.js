const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // Ensure secure is a boolean
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  }
});

// Middleware to send an email
const sendEmail = async (req, res, next) => {
  const { to, subject, text } = req.emailOptions;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully');
    next(); // Call next to proceed to the next middleware or controller
  } catch (error) {
    console.error('Failed to send email:', error);
    next(error); // Pass the error to the next middleware
  }
};

module.exports = sendEmail;
