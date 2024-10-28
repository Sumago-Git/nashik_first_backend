const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ObjectiveOfANF = sequelize.define('ObjectiveOfANF', {
  img: {
    type: DataTypes.STRING,
    allowNull: true,
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
}, {
  timestamps: true,
});

module.exports = ObjectiveOfANF;
