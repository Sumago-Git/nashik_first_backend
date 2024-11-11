const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  user_id: {
    type: DataTypes.INTEGER,
    defaultValue: 55, // Default user_id
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "APPROVED", // Default status
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: "NA", // Default payment method
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  certificate_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 22,
  },
  training_status: {
    type: DataTypes.STRING,
    defaultValue: "Confirmed", // Default training status
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

module.exports = BookingForm;
