const BookingForm = require("../models/BookingForm");
const apiResponse = require("../helper/apiResponse");

const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');



exports.uploadOrAddBookingForm = async (req, res) => {
  try {
    const { learningNo, fname, mname, lname, email, phone, vehicletype, slotdate, slotsession } = req.body;

    // Case 1: Handle file upload (XLSX)
    if (req.file) {
      const filePath = req.file.path; // Get file path from request
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Get the first sheet name
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

      // Log the extracted data
      console.log("Parsed data from XLSX:", data);

      // Store data in the database, but override slotdate and slotsession with form values
      const createdRecords = await Promise.all(data.map(async (item) => {
        try {
          const vehicletypeString = Array.isArray(item.vehicletype) ? item.vehicletype.join(",") : item.vehicletype;
          return await BookingForm.create({
            learningNo: item.learningNo,
            fname: item.fname,
            mname: item.mname,
            lname: item.lname,
            email: item.email,
            phone: item.phone,
            vehicletype: vehicletypeString,
            slotdate: slotdate,           // Override with form input
            slotsession: slotsession,      // Override with form input
          });
        } catch (error) {
          console.error('Error creating record:', error.errors ? error.errors : error);
          return null; // Return null for failed creations
        }
      }));

      // Filter out any null records (failed creations)
      const successfulRecords = createdRecords.filter(record => record !== null);

      // Respond with the count of created records
      return res.json({
        message: `${successfulRecords.length} records created successfully from the file.`,
        data: successfulRecords,
      });
    }

    // Case 2: Handle JSON input directly from form submission
    const vehicletypeString = Array.isArray(vehicletype) ? vehicletype.join(",") : vehicletype;

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
      isActive: true,
      isDelete: false,
    });

    return res.json({
      message: "Booking form added successfully",
      data: bookingForm,
    });
  } catch (error) {
    console.log("Error occurred:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};



exports.uploadXLSX = async (req, res) => {
  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Read and parse the uploaded XLSX file
    const filePath = req.file.path; // No need to prepend __dirname here
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

    // Log the extracted data
    console.log("Parsed data from XLSX:", data);

    // Store data in the database
    const createdRecords = await Promise.all(data.map(async (item) => {
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
        console.error('Error creating record:', error.errors ? error.errors : error);
        return null; // Return null for failed creations
      }
    }));

    // Filter out any null records (failed creations)
    const successfulRecords = createdRecords.filter(record => record !== null);

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
    const { learningNo, fname, mname, lname, email, phone, vehicletype, slotdate, slotsession } = req.body;

    // Convert the vehicletype array to a comma-separated string
    const vehicletypeString = Array.isArray(vehicletype) ? vehicletype.join(",") : vehicletype;

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

exports.updateBookingForm = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingForm = await BookingForm.findByPk(id);

    if (!bookingForm) {
      return apiResponse.notFoundResponse(res, "Booking form not found");
    }

    // Convert the vehicletype array to a comma-separated string
    if (req.body.vehicletype) {
      req.body.vehicletype = Array.isArray(req.body.vehicletype) ? req.body.vehicletype.join(",") : req.body.vehicletype;
    }

    Object.assign(bookingForm, req.body);
    await bookingForm.save();

    return apiResponse.successResponseWithData(res, "Booking form updated successfully", bookingForm);
  } catch (error) {
    console.log("Update booking form failed", error);
    return apiResponse.ErrorResponse(res, "Update booking form failed");
  }
};

exports.getBookingForm = async (req, res) => {
  try {
    const bookingForms = await BookingForm.findAll({ where: { isDelete: false } });

    // Convert the vehicletype string back to an array for each booking form
    const bookingFormsWithArray = bookingForms.map(form => ({
      ...form.toJSON(),
      vehicletype: form.vehicletype ? form.vehicletype.split(",") : [],
    }));

    return apiResponse.successResponseWithData(res, "Booking forms retrieved successfully", bookingFormsWithArray);
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

    return apiResponse.successResponseWithData(res, "Booking form status updated successfully", bookingForm);
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

    return apiResponse.successResponseWithData(res, "Booking form delete status updated successfully", bookingForm);
  } catch (error) {
    console.log("Toggle booking form delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle booking form delete status failed");
  }
};
