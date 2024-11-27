const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SlotRegisterInfo = sequelize.define("slotregisterinfo", {
  slotdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sessionSlotId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  slotsession: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  institution_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  institution_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  institution_phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coordinator_mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coordinator_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hm_principal_manager_mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hm_principal_manager_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = SlotRegisterInfo;
