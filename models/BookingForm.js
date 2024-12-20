const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Sessionslot = require("./sesssionslot");

const BookingForm = sequelize.define("BookingForm", {
  learningNo: {
    type: DataTypes.STRING,
    allowNull: true,

  },
  sessionSlotId: {
    type: DataTypes.INTEGER,  // Updated to INTEGER to match Sessionslot's id field
    allowNull: false,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicletype: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slotdate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tempdate: {
    type: DataTypes.DATE, // Keeping as DATE since it should store a full date and time
    allowNull: false,
  },
  slotsession: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  institution_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  institution_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  institution_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hm_principal_manager_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hm_principal_manager_mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coordinator_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coordinator_mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "APPROVED", // Default status
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: "NA", // Default payment method
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  certificate_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 22,
  },

  training_status: {
    type: DataTypes.STRING,
    defaultValue: "Confirmed", // Default training status
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
BookingForm.belongsTo(Sessionslot, {
  foreignKey: "sessionSlotId",
  as: "Sessionslot",
});
module.exports = BookingForm;


