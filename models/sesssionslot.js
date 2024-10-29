const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sessionslot = sequelize.define("Sessionslot", {
  deadlineTime: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required

  },
  capacity: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required

  },
  trainer: {
    type: DataTypes.STRING,
    allowNull: false, // assuming time is required
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false, // assuming sessions is required
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
