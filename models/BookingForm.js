const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const BookingEntries = require("./BookingEntries"); // Import BookingEntries model

const BookingForm = sequelize.define("BookingForm", {
  learningNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicletype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slotdate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slotsession: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Add afterCreate hook to insert into BookingEntries table when a new BookingForm entry is created
BookingForm.afterCreate(async (bookingForm, options) => {
  try {
    // Create a corresponding entry in BookingEntries, passing values directly
    await BookingEntries.create({
      fname: bookingForm.fname,
      lname: bookingForm.lname,
      email: bookingForm.email,
      phone: bookingForm.phone,
      vehicle_type: bookingForm.vehicletype,
      category: bookingForm.category,
      learningNo: bookingForm.learningNo, // Pass learningNo directly
      status: "Approved",  // Set default status
      payment_method: "NA",  // Set default payment method
      training_status: "Confirmed",  // Set default training status
      user_id: 55,  // Default user_id
      booking_date: bookingForm.slotdate, // Set the current date as booking_date
      submission_date: new Date(), // Set the current date as submission_date
      // No need to specify certificate_no as it's auto-incremented
    });
    console.log("BookingEntries entry created successfully.");
  } catch (error) {
    console.error("Error creating BookingEntries entry:", error);
  }
});

module.exports = BookingForm;
