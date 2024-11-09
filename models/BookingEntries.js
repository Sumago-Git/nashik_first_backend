const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingEntries = sequelize.define("BookingEntries", {
  user_id: {
    type: DataTypes.INTEGER,
    defaultValue: 55,  // Default user_id
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Approved",  // Default status
  },
  booking_date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: "NA",  // Default payment method
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certificate_no: {
    type: DataTypes.INTEGER,
    autoIncrement: true,  // Auto-increment certificate_no
    allowNull: false,
    primaryKey: true,
  },
  training_status: {
    type: DataTypes.STRING,
    defaultValue: "Confirmed",  // Default training status
  },
  learningNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicle_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,  // Default is active
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // Default is not deleted
  },
});

module.exports = BookingEntries;
