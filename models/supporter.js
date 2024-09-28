const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supporter = sequelize.define('Supporter', {
  img: {
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

module.exports = Supporter;
