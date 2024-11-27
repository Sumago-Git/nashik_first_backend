const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeBanner = sequelize.define('HomeBanner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Ensures the id field auto-increments
  },
  img2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  img1: {
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
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = HomeBanner;
