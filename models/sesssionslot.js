const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sessionslot = sequelize.define("Sessionslot", {
  deadlineTime: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // assuming title is required
  },
  capacity: {
    type: DataTypes.INTEGER,  // Change to INTEGER to represent numeric values
    allowNull: false, 
  },
  available_seats: {
    type: DataTypes.INTEGER,  // Change to INTEGER to represent numeric values
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  tempdate: {
    type: DataTypes.DATE,  // Keeping as DATE since it should store a full date and time
    allowNull: false, 
  },
  slotdate: {
    type: DataTypes.STRING,  // If you need to store the date as a string, keep it as STRING
    allowNull: false,
  },
  trainer: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Sessionslot are active by default
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // soft delete mechanism
  },
});

module.exports = Sessionslot;
