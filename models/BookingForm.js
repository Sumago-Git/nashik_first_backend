const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingForm = sequelize.define("BookingForm", {
  learningNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sessionSlotId: {
    type: DataTypes.STRING,
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
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicletype: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slotdate: {
    type: DataTypes.STRING,
    allowNull: false,
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
BookingForm.afterUpdate(async (bookingForm, options) => {
  if (bookingForm.training_status === "Attended" && bookingForm.changed("training_status")) {
    try {
      // Generate certificate_no based on the existing booking count and starting point
      const totalBookingForms = await BookingForm.count();

      const nextCertificateNo = totalBookingForms + 1;

      // Update certificate_no when status is updated to Attended
      await bookingForm.update({ certificate_no: nextCertificateNo });
    } catch (error) {
      console.error("Error updating certificate_no:", error);
    }
  }
});
module.exports = BookingForm;
