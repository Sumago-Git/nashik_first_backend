const BookingForm = require("../models/BookingForm");
const apiResponse = require("../helper/apiResponse");
const Sessionslot = require("../models/sesssionslot");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const xlsx = require("xlsx");
const sequelize = require("../config/database");
const { Op } = require("sequelize"); // Import Sequelize operators

const sendEmail = require("../middleware/nodemailer"); // Adjust the path as per your project structure

exports.uploadOrAddBookingForm = async (req, res) => {
  try {
    const {
      sessionSlotId,
      learningNo,
      fname,
      mname,
      lname,
      email,
      phone,
      vehicletype,
      slotdate,
      tempdate,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    } = req.body;

    // Default starting values for user_id and certificate_no
    const startingUserId = 55;
    const startingCertificateNo = 0;

    // Get the count of existing records to determine the next user_id and certificate_no
    const totalBookingForms = await BookingForm.count();

    // Calculate the next available user_id and certificate_no
    const nextUserId = startingUserId + totalBookingForms;
    const nextCertificateNo = startingCertificateNo + totalBookingForms;
    const sessionSlot = await Sessionslot.findByPk(sessionSlotId);

    if (!sessionSlot) {
      console.log("Session slot not found");
      return res.status(404).json({ message: "Session slot not found" });
    }
    const sessionTime = sessionSlot.time;

    await sessionSlot.update({
      available_seats: sessionSlot.available_seats - 1,
    });

    // Case 1: Handle file upload (XLSX)
    if (req.file) {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      console.log("Processing records from the file...");

      // Store data in the database with unique user_id and certificate_no
      const createdRecords = await Promise.all(
        data.map(async (item, index) => {
          try {
            const vehicletypeString = Array.isArray(item.vehicletype)
              ? item.vehicletype.join(",")
              : item.vehicletype;

            // Assign user_id and certificate_no based on the index
            const userId = nextUserId + index;
            const certificateNo = nextCertificateNo + index;

            const newRecord = await BookingForm.create({
              learningNo: item.learningNo,
              fname: item.fname,
              mname: item.mname,
              lname: item.lname,
              email: item.email,
              phone: item.phone,
              category: category,
              vehicletype: vehicletypeString,
              slotdate: slotdate,
              tempdate: tempdate,
              slotsession: slotsession,
              sessionSlotId: sessionSlotId,
              certificate_no: 0, // Incremented for each record
              user_id: userId, // Incremented for each record
              institution_name,
              institution_email,
              institution_phone,
              coordinator_mobile,
              coordinator_name,
              hm_principal_manager_mobile,
              hm_principal_manager_name,
            });

            // Send SMS
            const smsMessage = `Hi ${fname},Your booking for ${category === "RTO – Learner Driving License Holder Training" ? "RTO Learner Driving License Holder" : category} Training is confirmed on ${slotdate} Please be present 30 mins before at Traffic Park, Nr. Mumbai Naka. If any query please call 0253-2315966 Email: secretary@nashikfirst.com.`;
            const authKeyVal = "296048AL7IRUllNt5f5f388cP1";
            const senderId = "NSKFST";
            const DLT_TE_ID = "1707171473228451822";
            const smsUrl = `http://control.bestsms.co.in/api/sendhttp.php?authkey=${authKeyVal}&mobiles=${institution_phone}&message=${encodeURIComponent(
              smsMessage
            )}&sender=${senderId}&route=4&country=91&DLT_TE_ID=${DLT_TE_ID}`;
            console.log("smsUrl123", smsUrl);

            try {
              await axios.get(smsUrl);
              console.log(`SMS sent successfully to ${item.phone}`);
            } catch (smsError) {
              console.error(`Error sending SMS to ${item.phone}:`, smsError);
            }

            // Send email for each record created
            const emailSubject = "Booking Confirmation";
            const emailText = `Dear ${item.fname} ${sessionTime},\n\nYour booking has been successfully confirmed!\n\nDetails:\nLearning No: ${item.learningNo}\nVehicle Type: ${vehicletypeString}\nSlot Date: ${slotdate}\nSession: ${slotsession}\n\nThank you for choosing us.\n\nBest Regards,\nYour Company`;

            const emailHtml = `
              <h1>Booking Confirmation</h1>
              <p>Dear ${item.fname} ${item.lname},</p>
              <p>Your booking has been successfully confirmed!</p>
              <h3>Details:</h3>
              <ul>
                <li><strong>Slot Date:</strong> ${slotdate}</li>
                <li><strong>sessionTime:</strong> ${sessionTime}</li>
                <li><strong>Session:</strong> ${slotsession}</li>
              </ul>
              <p>Thank you for choosing us.</p>
              <p>Best Regards,<br>Your Company</p>
            `;

            console.log("Sending email to", sessionTime);
            try {
              await sendEmail(
                institution_email,
                emailSubject,
                emailText,
                emailHtml
              );
              console.log(
                `Confirmation email sent successfully to ${institution_email}`
              );
            } catch (error) {
              console.error(
                `Error sending email to ${institution_email}:`,
                error
              );
            }

            return newRecord;
          } catch (error) {
            console.error("Error creating record:", error);
            return null;
          }
        })
      );

      const successfulRecords = createdRecords.filter(
        (record) => record !== null
      );
      await sessionSlot.update({
        available_seats: sessionSlot.available_seats === 0,
      });
      return res.json({
        message: `${successfulRecords.length} records created successfully from the file.`,
        data: successfulRecords,
      });
    }
    const existingLearningNo = await BookingForm.findOne({
      where: {
        learningNo,
        category: "RTO – Learner Driving License Holder Training",
      },
    });
    if (existingLearningNo) {
      return res.status(400).json({
        message: `The learning number "${learningNo}" already exists. Please use a unique learning number.`,
      });
    }
    // Case 2: Handle JSON input directly from form submission
    const vehicletypeString = Array.isArray(vehicletype)
      ? vehicletype.join(",")
      : vehicletype;

    // Create a new record with unique user_id and certificate_no
    const bookingForm = await BookingForm.create({
      learningNo,
      fname,
      mname,
      lname,
      email,
      phone,
      vehicletype: vehicletypeString,
      category: category,
      slotdate,
      tempdate,
      slotsession,
      certificate_no: 0, // First record uses starting certificate_no
      user_id: nextUserId, // First record uses starting user_id
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
      sessionSlotId: sessionSlot.id,
      isActive: true,
      isDelete: false,
    });

    // Send SMS
    const smsMessage = `Hi ${fname},Your booking for ${category === "RTO – Learner Driving License Holder Training" ? "RTO Learner Driving License Holder" : category} Training is confirmed on ${slotdate} Please be present 30 mins before at Traffic Park, Nr. Mumbai Naka. If any query please call 0253-2315966 Email: secretary@nashikfirst.com.`;
    const authKeyVal = "296048AL7IRUllNt5f5f388cP1";
    const senderId = "NSKFST";
    const DLT_TE_ID = "1707171473228451822";
    const smsUrl = `http://control.bestsms.co.in/api/sendhttp.php?authkey=${authKeyVal}&mobiles=${phone}&message=${encodeURIComponent(
      smsMessage
    )}&sender=${senderId}&route=4&country=91&DLT_TE_ID=${DLT_TE_ID}`;
    console.log("smsUrl456", smsUrl);
    try {
      await axios.get(smsUrl);
      console.log(`SMS sent successfully to ${phone}`);
    } catch (smsError) {
      console.error(`Error sending SMS to ${phone}:`, smsError);
    }

    console.log("Sending confirmation email to", email);
    // Send email for the newly created booking form
    const emailSubject = "Booking Confirmation";
    const emailText = `Dear ${fname} ${lname},\n\nYour booking has been successfully confirmed!\n\nDetails:\nLearning No: ${learningNo}\nSlot Date: ${slotdate}\nSession: ${slotsession}\n\nThank you for choosing us.`;

    const emailHtml = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${fname} ${lname},</p>
      <p>Your booking has been successfully confirmed!</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Learning No:</strong> ${learningNo}</li>
        <li><strong>Slot Date:</strong> ${slotdate}</li>
        <li><strong>Session:</strong> ${slotsession}</li>
      </ul>
      <p>Thank you for choosing us.</p>
      
    `;

    try {
      await sendEmail(email, emailSubject, emailText, emailHtml);
      console.log("Confirmation email sent to", email);
    } catch (error) {
      console.error("Error sending email:", error);
    }

    return res.json({
      message: "Booking form added successfully. Confirmation email sent.",
      data: bookingForm,
    });
  } catch (error) {
    console.log("Error occurred:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.uploadXLSX = async (req, res) => {
  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Read and parse the uploaded XLSX file
    const filePath = req.file.path; // No need to prepend __dirname here
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

    // Log the extracted data

    // Store data in the database
    const createdRecords = await Promise.all(
      data.map(async (item) => {
        try {
          return await BookingForm.create({
            learningNo: item.learningNo, // Match the keys exactly as in the parsed data
            fname: item.fname,
            mname: item.mname,
            lname: item.lname,
            email: item.email,
            phone: item.phone,
            vehicletype: item.vehicletype,
            slotdate: item.slotdate,
            slotsession: item.slotsession,
          });
        } catch (error) {
          console.error(
            "Error creating record:",
            error.errors ? error.errors : error
          );
          return null; // Return null for failed creations
        }
      })
    );

    // Filter out any null records (failed creations)
    const successfulRecords = createdRecords.filter(
      (record) => record !== null
    );

    // Respond with the count of created records
    res.json({
      message: `${successfulRecords.length} records created successfully.`,
      data: successfulRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

exports.addBookingForm = async (req, res) => {
  try {
    const {
      learningNo,
      fname,
      mname,
      lname,
      email,
      phone,
      vehicletype,
      slotdate,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    } = req.body;

    // Convert the vehicletype array to a comma-separated string
    const vehicletypeString = Array.isArray(vehicletype)
      ? vehicletype.join(",")
      : vehicletype;

    const bookingForm = await BookingForm.create({
      learningNo,
      fname,
      mname,
      lname,
      email,
      phone,
      vehicletype: vehicletypeString,
      slotdate,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
      isActive: true,
      isDelete: false,
    });

    return apiResponse.successResponseWithData(
      res,
      "Booking form added successfully",
      bookingForm
    );
  } catch (error) {
    console.log("Add booking form failed", error);
    return apiResponse.ErrorResponse(res, "Add booking form failed");
  }
};

exports.getBookingEntriesByDateAndCategory = async (req, res) => {
  try {
    const { sessionSlotId, category, slotdate } = req.body;

    const bookingEntries = await BookingForm.findAll({
      where: {
        sessionSlotId,
        category,
        slotdate,
      },
      include: [
        {
          model: Sessionslot,
          as: "Sessionslot", // Correct alias should match here
          attributes: ["time"], // Ensure you select only necessary attributes
        },
      ],
    });

    // Map over the booking entries to include the session slot time
    const responseData = bookingEntries.map((entry) => {
      return {
        ...entry.dataValues,
        sessionSlotTime: entry.Sessionslot ? entry.Sessionslot.time : null, // Extracting time from the associated session slot
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Booking entries retrieved successfully",
      responseData
    );
  } catch (error) {
    console.log("Get booking entries by date and category failed", error);
    return apiResponse.ErrorResponse(
      res,
      "Get booking entries by date and category failed"
    );
  }
};

// Ensure moment is imported

exports.getAllEntriesByCategory = async (req, res) => {
  try {
    const { category } = req.body;

    // Get today's date at the start of the day, formatted as MM/DD/YYYY
    const today = moment().startOf("day").format("YYYY-MM-DD"); // Format today's date as MM/DD/YYYY

    // Query the database for booking entries where slotdate is today or later
    const bookingEntries = await BookingForm.findAll({
      where: {
        category,
        tempdate: {
          [Op.gt]: today, // Compare slotdate to today's date (formatted as MM/DD/YYYY)
        },
      },
    });

    return apiResponse.successResponseWithData(
      res,
      "Booking entries by category retrieved successfully",
      bookingEntries
    );
  } catch (error) {
    console.log("Get booking entries by category failed", error);
    return apiResponse.ErrorResponse(
      res,
      "Get booking entries by category failed"
    );
  }
};

exports.updateTrainingStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { bookingId, trainingStatus } = req.body;

    // Fetch the BookingForm by ID
    const bookingForm = await BookingForm.findByPk(bookingId, { transaction });

    if (!bookingForm) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update training_status
    bookingForm.training_status = trainingStatus;

    if (trainingStatus === "Attended") {
      const validCategories = [
        "RTO – Learner Driving License Holder Training",
        "RTO – Suspended Driving License Holders Training",
        "RTO – Training for School Bus Driver",
        "College/Organization Training – Group",
      ];

      if (validCategories.includes(bookingForm.category)) {
        // Obtain a database lock to avoid race conditions
        const startingCertificateNo = 0;

        // Lock table or use transaction isolation to ensure unique numbers
        const attendedCount = await BookingForm.count({
          where: {
            training_status: "Attended",
            category: {
              [Op.in]: validCategories, // Ensure the category is in the validCategories array
            },
          },
          lock: transaction.LOCK.UPDATE, // Locking mechanism
          transaction,
        });

        // Calculate the next certificate_no
        const nextCertificateNo = startingCertificateNo + attendedCount + 1;

        // Update the certificate_no for the current record
        bookingForm.certificate_no = nextCertificateNo;
      }
    }

    // Save changes to the database
    await bookingForm.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    return res.json({
      message: `Training status updated to ${trainingStatus}`,
      data: bookingForm,
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    console.error("Error updating training status:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.updateBookingForm = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingForm = await BookingForm.findByPk(id);

    if (!bookingForm) {
      return apiResponse.notFoundResponse(res, "Booking form not found");
    }

    // Convert the vehicletype array to a comma-separated string

    Object.assign(bookingForm, req.body);
    await bookingForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking form updated successfully",
      bookingForm
    );
  } catch (error) {
    console.log("Update booking form failed", error);
    return apiResponse.ErrorResponse(res, "Update booking form failed");
  }
};

exports.getBookingForm = async (req, res) => {
  try {
    const bookingForms = await BookingForm.findAll({
      where: { isDelete: false },
    });

    // Convert the vehicletype string back to an array for each booking form
    const bookingFormsWithArray = bookingForms.map((form) => ({
      ...form.toJSON(),
      vehicletype: form.vehicletype ? form.vehicletype.split(",") : [],
    }));

    return apiResponse.successResponseWithData(
      res,
      "Booking forms retrieved successfully",
      bookingFormsWithArray
    );
  } catch (error) {
    console.log("Get booking forms failed", error);
    return apiResponse.ErrorResponse(res, "Get booking forms failed");
  }
};

exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingForm = await BookingForm.findByPk(id);

    if (!bookingForm) {
      return apiResponse.notFoundResponse(res, "Booking form not found");
    }

    bookingForm.isActive = !bookingForm.isActive;
    await bookingForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking form status updated successfully",
      bookingForm
    );
  } catch (error) {
    console.log("Toggle booking form status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle booking form status failed");
  }
};

exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingForm = await BookingForm.findByPk(id);

    if (!bookingForm) {
      return apiResponse.notFoundResponse(res, "Booking form not found");
    }

    bookingForm.isDelete = !bookingForm.isDelete;
    await bookingForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking form delete status updated successfully",
      bookingForm
    );
  } catch (error) {
    console.log("Toggle booking form delete status failed", error);
    return apiResponse.ErrorResponse(
      res,
      "Toggle booking form delete status failed"
    );
  }
};

exports.deleteBookingForm = async (req, res) => {
  try {
    // Parse today's date
    const today = moment().startOf("day"); // Start of the current day

    // Find booking forms matching the criteria
    const bookingFormsToDelete = await BookingForm.findAll({
      where: {
        training_status: "Confirmed", // Training status is "Confirmed"
        slotdate: {
          [Op.lt]: today.format("MM/DD/YYYY"), // Slot date is earlier than today
        },
        isActive: true, // Ensure the booking form is active
        isDelete: false, // Ensure the booking form is not marked as deleted
      },
    });

    if (bookingFormsToDelete.length === 0) {
      console.log("No booking forms found matching the criteria");

      // return apiResponse.notFoundResponse(
      //   res,
      //   "No booking forms found matching the criteria"
      // );
    }

    // Delete all matching booking forms
    const deletedCount = await BookingForm.destroy({
      where: {
        id: bookingFormsToDelete.map((form) => form.id), // Delete by IDs
      },
    });

    return apiResponse.successResponse(
      res,
      `${deletedCount} booking forms deleted successfully`
    );
  } catch (error) {
    console.error("Delete booking form failed", error);
    // return apiResponse.ErrorResponse(res, "Delete booking form failed");
  }
};

const SlotRegisterInfo = require("../models/SlotRegisterInfo");
const { default: axios } = require("axios");

exports.registerSlotInfo = async (req, res) => {
  try {
    const {
      slotdate,
      sessionSlotId,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    } = req.body;

    // Validate required fields
    if (
      !slotdate ||
      !category ||
      !institution_name ||
      !institution_email ||
      !institution_phone ||
      !coordinator_mobile ||
      !coordinator_name
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Create a new SlotRegisterInfo record
    const slotInfo = await SlotRegisterInfo.create({
      slotdate,
      sessionSlotId,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    });
    const sessionSlot = await Sessionslot.findByPk(sessionSlotId);
    await sessionSlot.update({
      available_seats: sessionSlot.available_seats === 0,
    });

    // Send SMS
    const smsMessage = `Hi ${coordinator_name},Your booking for ${category === "RTO – Learner Driving License Holder Training" ? "RTO Learner Driving License Holder" : category} Training is confirmed on ${slotdate} Please be present 30 mins before at Traffic Park, Nr. Mumbai Naka. If any query please call 0253-2315966 Email: secretary@nashikfirst.com.`;
    const authKeyVal = "296048AL7IRUllNt5f5f388cP1";
    const senderId = "NSKFST";
    const DLT_TE_ID = "1707171473228451822";
    const smsUrl = `http://control.bestsms.co.in/api/sendhttp.php?authkey=${authKeyVal}&mobiles=${institution_phone}&message=${encodeURIComponent(
      smsMessage
    )}&sender=${senderId}&route=4&country=91&DLT_TE_ID=${DLT_TE_ID}`;
    console.log("smsUrl789", smsUrl);
    try {
      await axios.get(smsUrl);
      console.log(`SMS sent successfully to ${institution_phone}`);
    } catch (smsError) {
      console.error(`Error sending SMS to ${institution_phone}:`, smsError);
    }

    // // Prepare email content
    const emailSubject = "Group Booking Confirmation";
    const emailText = `Dear ${coordinator_name},\n\nYour booking has been successfully confirmed!\n\nDetails:\nInstitution Name: ${institution_name}\nSlot Date: ${slotdate}\nSession: ${slotsession}\n\nThank you for choosing us.`;

    const emailHtml = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${coordinator_name},</p>
      <p>Your booking has been successfully confirmed!</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Institution Name:</strong> ${institution_name}</li>
        <li><strong>Slot Date:</strong> ${slotdate}</li>
        <li><strong>Session:</strong> ${slotsession}</li>
      </ul>
      <p>Thank you for choosing us.</p>
      <p>Best Regards,<br>Your Company</p>
    `;

    // Send email
    console.log("Sending email to", institution_email);
    try {
      await sendEmail(institution_email, emailSubject, emailText, emailHtml);
      console.log(
        `Confirmation email sent successfully to ${institution_email}`
      );
    } catch (error) {
      console.error(`Error sending email to ${institution_email}:`, error);
    }

    return res.status(201).json({
      message: "Slot registration information added successfully.",
      data: slotInfo,
    });
  } catch (error) {
    console.error("Error creating slot register info:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// Controller method to fetch slot details by sessionSlotId
exports.getSlotInfo = async (req, res) => {
  try {
    // Extract sessionSlotId from the request parameters
    const { sessionSlotId } = req.body;

    // Find the SlotRegisterInfo by sessionSlotId
    const slotInfo = await SlotRegisterInfo.findOne({
      where: { sessionSlotId: sessionSlotId },
    });

    // If slot information is not found, return 404
    if (!slotInfo) {
      return res.status(404).json({ message: "Slot not found." });
    }

    // Return the found slot information
    return res.status(200).json({
      message: "Slot details fetched successfully.",
      data: slotInfo,
    });
  } catch (error) {
    console.error("Error fetching slot details:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// Get Slot Registration Info
exports.getSlotInfobyid = async (req, res) => {
  try {
    const { id } = req.params; // Get the slot ID from the URL parameter

    // Find the slot registration info by ID
    const slotInfo = await SlotRegisterInfo.findByPk(id);

    if (!slotInfo) {
      return res.status(404).json({ message: "Slot registration not found." });
    }

    // Respond with the slot registration details
    return res.status(200).json({
      message: "Slot registration retrieved successfully.",
      data: slotInfo,
    });
  } catch (error) {
    console.error("Error fetching slot register info:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

exports.updateSlotInfo = async (req, res) => {
  try {
    const { id } = req.params; // Get the slot ID from the URL parameter

    // Check if the id is provided and is a valid number
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid or missing slot ID." });
    }

    const {
      slotdate,
      sessionSlotId,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    } = req.body;

    // Find the slot registration by ID
    const slotInfo = await SlotRegisterInfo.findByPk(id);

    // If slotInfo is null, the record wasn't found
    if (!slotInfo) {
      return res
        .status(404)
        .json({ message: `Slot registration with ID ${id} not found.` });
    }

    // Update the slot registration information
    await slotInfo.update({
      slotdate,
      sessionSlotId,
      slotsession,
      category,
      institution_name,
      institution_email,
      institution_phone,
      coordinator_mobile,
      coordinator_name,
      hm_principal_manager_mobile,
      hm_principal_manager_name,
    });

    // Update the related session slot's available seats (if needed)
    const sessionSlot = await Sessionslot.findByPk(sessionSlotId);
    if (sessionSlot) {
      await sessionSlot.update({
        available_seats: sessionSlot.available_seats === 0,
      });
    }

    return res.status(200).json({
      message: "Slot registration updated successfully.",
      data: slotInfo,
    });
  } catch (error) {
    console.error("Error updating slot register info:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

exports.deleteSlotInfo = async (req, res) => {
  try {
    const { id } = req.params; // Get the slot registration ID from the URL parameter

    // Check if the slot ID exists in the slotRegisterInfos
    const slotInfo = await SlotRegisterInfo.findByPk(id);
    if (!slotInfo) {
      return res.status(404).json({ message: "Slot registration not found." });
    }

    // Check if the same sessionSlotId has been registered elsewhere
    const existingRegistration = await BookingForm.findOne({
      where: {
        sessionSlotId: slotInfo.sessionSlotId,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });

    if (existingRegistration) {
      return res.status(400).json({
        message: "You have already registered for this session slot.",
      });
    }

    // Delete the slot registration
    await slotInfo.destroy();

    // Optionally, update the available seats on the session slot
    const sessionSlot = await Sessionslot.findByPk(slotInfo.sessionSlotId);
    if (sessionSlot) {
      await sessionSlot.update({
        available_seats: sessionSlot.available_seats + 1, // Increase available seats
      });
    }

    return res
      .status(200)
      .json({ message: "Slot registration deleted successfully." });
  } catch (error) {
    console.error("Error deleting slot register info:", error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};
