const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 8000;
const cors = require("cors");
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


app.use(bodyParser.json());


app.use("/uploads", express.static("uploads"));

const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const officeRoutes = require('./routes/officeRoutes');
const homeBannerRoutes = require('./routes/homeBannerRoutes');
const socialContactRoutes = require("./routes/SocialContactRoute");
const homecounter = require("./routes/HomeCounterRoute");
const gallery = require("./routes/photoGalleryRoutes");
const supporter = require("./routes/supporterRoutes");
const contactDetails = require("./routes/contactDetailsRoutes");

app.use('/office', officeRoutes);
app.use('/counter', homecounter);
app.use('/gallery', gallery);
app.use('/homeBanner', homeBannerRoutes);
app.use('/supporter', supporter);
app.use("/auth", authRoutes);
app.use("/social-contact", socialContactRoutes);
app.use("/contact-detail", contactDetails);

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
