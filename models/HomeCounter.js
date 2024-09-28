const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HomeCounter = sequelize.define("HomeCounter", {
  training_imparted: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lives_changed: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  children: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adult: {
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

module.exports = HomeCounter;
