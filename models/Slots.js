const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Slots = sequelize.define("Slots", {
  time: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  sessions: {
    type: DataTypes.STRING,
    allowNull: false, // assuming sessions is required
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

module.exports = Slots;
