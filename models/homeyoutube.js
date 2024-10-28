const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Homeyoutube = sequelize.define("Homeyoutube", {
  mediaurl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
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

module.exports = Homeyoutube;
