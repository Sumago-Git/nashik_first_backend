const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeBanner = sequelize.define('HomeBanner', {
  img1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  img2: {
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
  timestamps: true,
});

module.exports = HomeBanner;
