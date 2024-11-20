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
      const startingCertificateNo = 22;

      // Count records where training_status is "Attended" AND exclude the current record
      const attendedCount = await BookingForm.count({
        where: {
          training_status: "Attended",
          id: { [sequelize.Op.ne]: bookingForm.id }, // Exclude current record
        },
      });

      // Calculate the next certificate_no
      const nextCertificateNo = startingCertificateNo + attendedCount;

      // Update only the current record's certificate_no
      bookingForm.certificate_no = nextCertificateNo;
      await bookingForm.save({ transaction: options.transaction });

      console.log(
        `Certificate number updated to ${nextCertificateNo} for booking ID ${bookingForm.id}`
      );
    } catch (error) {
      console.error("Error updating certificate_no:", error);
      throw error;
    }
  }
});

