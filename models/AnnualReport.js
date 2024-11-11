const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnnualReport = sequelize.define('AnnualReport', {
  file: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  financialYear: {
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
  timestamps: true, // Enable createdAt and updatedAt fields
});

module.exports = AnnualReport;
