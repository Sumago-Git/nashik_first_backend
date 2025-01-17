const cron = require('node-cron');
const { deleteBookingForm } = require('../controllers/BookingFormController');
const sendEmail = require('./nodemailer');

// Schedule the cron job to run at 12 AM every day except Saturdays
const setupCronJobs = () => {
  cron.schedule('0 20  * * 0-5,7', async () => {
    console.log("Running nightly delete job for bookings...");

    try {
      await deleteBookingForm(); // Call your function directly
      console.log("Nightly delete job completed.");
    } catch (error) {
      console.error("Error during nightly delete job:", error);
    }

    try {
      await sendEmail(
        "maheshmhaske500@gmail.com",
        "Test Subject",
        "Test Subject",
        "emailHtml"
      );
      console.log(
        `Confirmation email sent successfully to ${"skothavade09@gmail.com"}`
      );
    } catch (error) {
      console.error(
        `Error sending email to ${"skothavade09@gmail.com"}:`,
        error
      );
    }

  });

  console.log("Cron jobs initialized.");
};

module.exports = setupCronJobs;
