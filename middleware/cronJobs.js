const cron = require('node-cron');
// const { deleteBookingForm } = require('../controllers/BookingFormController');

// Schedule the cron job to run at 12 AM every day except Saturdays
const setupCronJobs = () => {
  cron.schedule('0 0 * * 0-5,7', async () => {
    console.log("Running nightly delete job for bookings...");
    try {
      // await deleteBookingForm(); // Call your function directly
      console.log("Nightly delete job completed.");
    } catch (error) {
      console.error("Error during nightly delete job:", error);
    }
  });

  console.log("Cron jobs initialized.");
};

module.exports = setupCronJobs;
