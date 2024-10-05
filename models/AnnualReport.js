// /models/annualReportModel.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as necessary

const AnnualReport = sequelize.define('AnnualReport', {
  financialYear: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Financial Year is required',
      }
    },
  },
  links: {
    type: DataTypes.STRING, // Stores the file path or URL
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'PDF link is required',
      },
      isUrl: {
        msg: 'PDF link must be a valid URL', // If storing URLs
      },
    },
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
