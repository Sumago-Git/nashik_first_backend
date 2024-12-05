  const { DataTypes } = require("sequelize");
  const sequelize = require("../config/database");
  const SlotRegisterInfo = require("./SlotRegisterInfo");

  const Sessionslot = sequelize.define("Sessionslots", {
    deadlineTime: {
      type: DataTypes.STRING,
      allowNull: false, // assuming time is required
    },
    slotType: {
      type: DataTypes.STRING,
      allowNull: false, // assuming title is required
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // assuming title is required
    },
    capacity: {
      type: DataTypes.INTEGER, // Change to INTEGER to represent numeric values
      allowNull: false,
    },
    available_seats: {
      type: DataTypes.INTEGER, // Change to INTEGER to represent numeric values
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false, // assuming time is required
    },
    tempdate: {
      type: DataTypes.DATE, 
      allowNull: false,
    },
    slotdate: {
      type: DataTypes.STRING, // If you need to store the date as a string, keep it as STRING
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
      defaultValue: true, // Sessionslot are active by default
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // soft delete mechanism
    },
  });

  Sessionslot.hasMany(SlotRegisterInfo, {
    foreignKey: "sessionSlotId",
    as: "slotRegisterInfos", // Alias for eager loading
  });

  SlotRegisterInfo.belongsTo(Sessionslot, {
    foreignKey: "sessionSlotId",
    as: "Sessionslots", // Alias for eager loading
  });
  module.exports = Sessionslot;







  // const BookingForm = require("./BookingForm");

  // Sessionslot.hasMany(BookingForm, {
  //   foreignKey: "sessionSlotId", // Foreign key in BookingForm
  //   as: "bookingForms", // Alias for eager loading
  // });
