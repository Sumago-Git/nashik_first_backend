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
