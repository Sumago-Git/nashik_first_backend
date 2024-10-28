const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upcomming = sequelize.define('Upcomming', {
  img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fromdate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  todate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area: {
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
}, {
  timestamps: true,
});

module.exports = Upcomming;
