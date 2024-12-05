const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SlotRegisterInfo = require("./SlotRegisterInfo");

const Sessionslot = sequelize.define("Sessionslot", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Ensures it is an auto-incrementing integer
  },
  deadlineTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slotType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  available_seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tempdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  slotdate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  trainer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
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

Sessionslot.hasMany(SlotRegisterInfo, {
  foreignKey: "sessionSlotId",
  as: "slotRegisterInfos", // Alias for eager loading
});

SlotRegisterInfo.belongsTo(Sessionslot, {
  foreignKey: "sessionSlotId",
  as: "sessionSlot", // Alias for eager loading
});

module.exports = Sessionslot;
