const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 8000;
const cors = require("cors");
const setupCronJobs = require('./middleware/cronJobs');
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use("/uploads", express.static("uploads"));

// Initialize cron jobs
setupCronJobs();
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const officeRoutes = require("./routes/officeRoutes");
const homeBannerRoutes = require("./routes/homeBannerRoutes");
const socialContactRoutes = require("./routes/SocialContactRoute");
const homecounter = require("./routes/HomeCounterRoute");
const homeyoutube = require("./routes/homeyoutubeRoute");

const gallery = require("./routes/photoGalleryRoutes");
const thanksto = require("./routes/ThanksToRoutes");
const objectiveofANF = require("./routes//ObjectiveOfANFRoutes");
const PostEvents = require("./routes/PostEventsRoutes");
const EventGallary = require("./routes/EventGallaryRoutes")
const supporter = require("./routes/supporterRoutes");
const contactDetails = require("./routes/contactDetailsRoutes");
const holiday = require("./routes/HolidayRoutes");
const slotSession = require("./routes/slots");
const BookingForm = require("./routes/BookingFormRoutes");
const AvailableSeat = require("./routes/AvailableSeatsRoutes");
const news = require("./routes/NewsRoute")
const Videos = require("./routes/VideosRoute")
const Directors = require("./routes/DirectorsRoute")
const Upcomming = require("./routes/UpcommingRoutes")
const AnnualReport = require("./routes/AnnualReportRoutes")
const AnnualReturn = require("./routes/AnnualReturnRoutes")
const Sessionslot = require("./routes/Sessionslot")
const ContactForm = require("./routes/contactFormRoutes")
const Trainer = require("./routes/trainerRoutes")
const Individuals = require('./routes/IndividualsRoutes')
const certification = require('./routes/certificateRoutes')
const Counts = require('./routes/CountRoute')
app.use("/counts", Counts);
app.use("/certificate", certification);
app.use("/trainer", Trainer);
app.use("/contactform", ContactForm);
app.use("/bookingform", BookingForm);
app.use("/slots", slotSession);
app.use("/holiday", holiday);
app.use("/office", officeRoutes);
app.use("/counter", homecounter);
app.use("/gallery", gallery);
app.use("/thanksto", thanksto);
app.use("/objectiveofANF", objectiveofANF);
app.use("/news", news);
app.use("/Videos", Videos);
app.use("/Directors", Directors)
app.use("/PostEvents", PostEvents);
app.use('/EventGallary', EventGallary)
app.use("/homeBanner", homeBannerRoutes);
app.use('/homeyoutube', homeyoutube);
app.use('/Upcomming', Upcomming)
app.use("/supporter", supporter);
app.use("/auth", authRoutes);
app.use("/social-contact", socialContactRoutes);
app.use("/contact-detail", contactDetails);
app.use("/seats", AvailableSeat);
app.use("/AnnualReport", AnnualReport)
app.use("/AnnualReturn", AnnualReturn)
app.use("/Sessionslot", Sessionslot)
app.use("/Individuals", Individuals)
// Test DB connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");
    await sequelize.sync(); // Ensure the database and model are in sync
  } catch (err) {
    console.error("Error: " + err);
  }
};

// Initialize the application
const init = async () => {
  await testDbConnection();
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

init();

app.get("/", (req, res) => {
  res.send("server start");
});
