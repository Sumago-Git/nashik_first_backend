const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnnualReturn = sequelize.define('AnnualReturn', {
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

module.exports = AnnualReturn;
