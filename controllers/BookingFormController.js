const BookingForm = require("../models/BookingForm");
const apiResponse = require("../helper/apiResponse");
const Sessionslot = require("../models/sesssionslot");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

// exports.uploadOrAddBookingForm = async (req, res) => {
//   try {
//     const {
//       learningNo,
//       fname,
//       mname,
//       lname,
//       email,
//       phone,
//       vehicletype,
//       slotdate,
//       slotsession,
//       category,
//       institution_name,
//       institution_email,
//       institution_phone,
//       coordinator_mobile,
//       coordinator_name,
//       hm_principal_manager_mobile,
//       hm_principal_manager_name
//     } = req.body;

//     // Default starting values for user_id and certificate_no
//     const startingUserId = 55;
//     const startingCertificateNo = 22;

//     // Get the count of existing records to determine the next user_id and certificate_no
//     const totalBookingForms = await BookingForm.count();

//     // Calculate the next available user_id and certificate_no
//     const nextUserId = startingUserId + totalBookingForms;
//     const nextCertificateNo = startingCertificateNo + totalBookingForms;
//     const sessionSlot = await Sessionslot.findOne({
//       where: { slotdate, title: slotsession, category }
//     });

//     if (!sessionSlot) {
//       return res.status(404).json({ message: "Session slot not found" });
//       console.log("Session slot not found")
//     }

//     if (sessionSlot.available_seats <= 0) {
//       return res.status(400).json({ message: "No available seats for this session slot" });
//       console.log("No available seats for this session slot")
//     }

//     // Decrement available_seats by 1
//     await sessionSlot.update({ available_seats: sessionSlot.available_seats - 1 });
//     console.log("done")
//     // Case 1: Handle file upload (XLSX)
//     if (req.file) {
//       const filePath = req.file.path;
//       const workbook = xlsx.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//       // Store data in the database with unique user_id and certificate_no
//       const createdRecords = await Promise.all(
//         data.map(async (item, index) => {
//           try {
//             const vehicletypeString = Array.isArray(item.vehicletype)
//               ? item.vehicletype.join(",")
//               : item.vehicletype;

//             // Assign user_id and certificate_no based on the index
//             const userId = nextUserId + index;
//             const certificateNo = nextCertificateNo + index;

//             const newRecord = await BookingForm.create({
//               learningNo: item.learningNo,
//               fname: item.fname,
//               mname: item.mname,
//               lname: item.lname,
//               email: item.email,
//               phone: item.phone,
//               category: category,
//               vehicletype: vehicletypeString,
//               slotdate: slotdate,
//               slotsession: slotsession,
//               certificate_no: certificateNo, // Incremented for each record
//               user_id: userId, // Incremented for each record
//               institution_name,
//               institution_email,
//               institution_phone,
//               coordinator_mobile,
//               coordinator_name,
//               hm_principal_manager_mobile,
//               hm_principal_manager_name
//             });

//             return newRecord;
//           } catch (error) {
//             console.error("Error creating record:", error);
//             return null;
//           }
//         })
//       );

//       const successfulRecords = createdRecords.filter((record) => record !== null);

//       return res.json({
//         message: `${successfulRecords.length} records created successfully from the file.`,
//         data: successfulRecords,
//       });
//     }

//     // Case 2: Handle JSON input directly from form submission
//     const vehicletypeString = Array.isArray(vehicletype)
//       ? vehicletype.join(",")
//       : vehicletype;

//     // Create a new record with unique user_id and certificate_no
//     const bookingForm = await BookingForm.create({
//       learningNo,
//       fname,
//       mname,
//       lname,
//       email,
//       phone,
//       vehicletype: vehicletypeString,
//       category: category,
//       slotdate,
//       slotsession,
//       certificate_no: nextCertificateNo, // First record uses starting certificate_no
//       user_id: nextUserId, // First record uses starting user_id
//       institution_name,
//       institution_email,
//       institution_phone,
//       coordinator_mobile,
//       coordinator_name,
//       hm_principal_manager_mobile,
//       hm_principal_manager_name,
//       isActive: true,
//       isDelete: false,
//     });

//     return res.json({
//       message: "Booking form added successfully",
//       data: bookingForm,
//     });
//   } catch (error) {
//     console.log("Error occurred:", error);
//     return res.status(500).json({ message: "An error occurred", error: error.message });
//   }
// };

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
    const startingCertificateNo = 22;

    // Get the count of existing records to determine the next user_id and certificate_no
    const totalBookingForms = await BookingForm.count();

    // Calculate the next available user_id and certificate_no
    const nextUserId = startingUserId + totalBookingForms;
    const nextCertificateNo = startingCertificateNo + totalBookingForms;
    const sessionSlot = await Sessionslot.findByPk(sessionSlotId)

    if (!sessionSlot) {
      console.log("Session slot not found");
      return res.status(404).json({ message: "Session slot not found" });
    }

    if (sessionSlot.available_seats <= 0) {
      console.log("No available seats for this session slot");
      return res
        .status(400)
        .json({ message: "No available seats for this session slot" });
    }

    // Decrement available_seats by 1
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
              slotsession: slotsession,
              certificate_no: certificateNo, // Incremented for each record
              user_id: userId, // Incremented for each record
              institution_name,
              institution_email,
              institution_phone,
              coordinator_mobile,
              coordinator_name,
              hm_principal_manager_mobile,
              hm_principal_manager_name,
            });

            // Send email for each record created
            const emailSubject = "Booking Confirmation";
            const emailText = `Dear ${item.fname} ${item.lname},\n\nYour booking has been successfully confirmed!\n\nDetails:\nLearning No: ${item.learningNo}\nVehicle Type: ${vehicletypeString}\nSlot Date: ${slotdate}\nSession: ${slotsession}\n\nThank you for choosing us.\n\nBest Regards,\nYour Company`;

            const emailHtml = `
              <h1>Booking Confirmation</h1>
              <p>Dear ${item.fname} ${item.lname},</p>
              <p>Your booking has been successfully confirmed!</p>
              <h3>Details:</h3>
              <ul>
                <li><strong>Learning No:</strong> ${item.learningNo}</li>
                <li><strong>Vehicle Type:</strong> ${vehicletypeString}</li>
                <li><strong>Slot Date:</strong> ${slotdate}</li>
                <li><strong>Session:</strong> ${slotsession}</li>
              </ul>
              <p>Thank you for choosing us.</p>
              <p>Best Regards,<br>Your Company</p>
            `;

            console.log("Sending email to", item.email);
            try {
              await sendEmail(item.email, emailSubject, emailText, emailHtml);
              console.log(`Confirmation email sent successfully to ${item.email}`);
            } catch (error) {
              console.error(`Error sending email to ${item.email}:`, error);
            }

            return newRecord;
          } catch (error) {
            console.error("Error creating record:", error);
            return null;
          }
        })
      );

      const successfulRecords = createdRecords.filter((record) => record !== null);
      await sessionSlot.update({ available_seats: sessionSlot.available_seats === 0 });
      return res.json({
        message: `${successfulRecords.length} records created successfully from the file.`,
        data: successfulRecords,
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
      slotsession,
      certificate_no: nextCertificateNo, // First record uses starting certificate_no
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

    console.log("Sending confirmation email to", email);
    // Send email for the newly created booking form
    const emailSubject = "Booking Confirmation";
    const emailText = `Dear ${fname} ${lname},\n\nYour booking has been successfully confirmed!\n\nDetails:\nLearning No: ${learningNo}\nVehicle Type: ${vehicletypeString}\nSlot Date: ${slotdate}\nSession: ${slotsession}\n\nThank you for choosing us.\n\nBest Regards,\nYour Company`;

    const emailHtml = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${fname} ${lname},</p>
      <p>Your booking has been successfully confirmed!</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Learning No:</strong> ${learningNo}</li>
        <li><strong>Vehicle Type:</strong> ${vehicletypeString}</li>
        <li><strong>Slot Date:</strong> ${slotdate}</li>
        <li><strong>Session:</strong> ${slotsession}</li>
      </ul>
      <p>Thank you for choosing us.</p>
      <p>Best Regards,<br>Your Company</p>
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
    const { slotsession, sessionSlotId, category, } = req.body;

    if (!slotsession) {
      return apiResponse.validationErrorWithData(
        res,
        "slotsession is required",
        {}
      );
    }

    const bookingEntries = await BookingForm.findAll({
      where: {
        slotsession,sessionSlotId,category
      },
    });

    return apiResponse.successResponseWithData(
      res,
      "Booking entries retrieved successfully",
      bookingEntries
    );
  } catch (error) {
    console.log("Get booking entries by date and category failed", error);
    return apiResponse.ErrorResponse(
      res,
      "Get booking entries by date and category failed"
    );
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
    if (req.body.vehicletype) {
      req.body.vehicletype = Array.isArray(req.body.vehicletype)
        ? req.body.vehicletype.join(",")
        : req.body.vehicletype;
    }

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
