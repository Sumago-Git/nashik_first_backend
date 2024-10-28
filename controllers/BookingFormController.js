const BookingForm = require("../models/BookingForm");
const apiResponse = require("../helper/apiResponse");

exports.addBookingForm = async (req, res) => {
  try {
    const { learningNo, fname, mname, lname, email, phone, vehicletype, slotdate, slotsession, category } = req.body;
    
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
      category,
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
