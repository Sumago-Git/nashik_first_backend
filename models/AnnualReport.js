const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AnnualReport = sequelize.define("AnnualReport", {
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  links: {
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

module.exports = AnnualReport;
