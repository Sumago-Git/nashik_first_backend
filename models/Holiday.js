const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Holiday = sequelize.define("Holiday", {
  holiday_date: {
    type: DataTypes.STRING, // Keeping it as STRING for storing dates
    allowNull: false,
  },
  tempdate: {
    type: DataTypes.DATE,
    allowNull: false, // assuming time is required
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

module.exports = Holiday;
