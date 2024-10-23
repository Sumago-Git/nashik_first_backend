const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const homeyoutube = sequelize.define("homeyoutube", {
  mediaurl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
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

module.exports = homeyoutube;
