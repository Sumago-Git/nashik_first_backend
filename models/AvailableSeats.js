const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SeatAvailability = sequelize.define("SeatAvailability", {
  seatCount: {
    type: DataTypes.INTEGER, // Change from STRING to INTEGER
    allowNull: false, // assuming seatCount is required
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // slots are active by default
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // soft delete mechanism
  },
});

module.exports = SeatAvailability;
