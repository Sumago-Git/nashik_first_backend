// models/SocialContact.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SocialContact = sequelize.define("SocialContact", {
  facebook: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  youtube: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  twitter: {
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

module.exports = SocialContact;
