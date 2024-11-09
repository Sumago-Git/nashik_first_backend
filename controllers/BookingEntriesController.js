const BookingEntries = require("../models/BookingEntries");
const apiResponse = require("../helper/apiResponse");
const { Op } = require("sequelize");
exports.addBookingEntry = async (req, res) => {
  try {
    const {
      booking_date,
      submission_date,
      fname,
      lname,
      category,
      learningNo,
      email,
      phone,
      vehicle_type,
    } = req.body;

    const bookingEntry = await BookingEntries.create({
      booking_date,
      submission_date,
      fname,
      lname,
      category,
      learningNo,
      email,
      phone,
      vehicle_type,
    });

    return apiResponse.successResponseWithData(
      res,
      "Booking entry created successfully",
      bookingEntry
    );
  } catch (error) {
    console.log("Add booking entry failed", error);
    return apiResponse.ErrorResponse(res, "Add booking entry failed");
  }
};

exports.getBookingEntries = async (req, res) => {
  try {
    const bookingEntries = await BookingEntries.findAll();

    return apiResponse.successResponseWithData(
      res,
      "Booking entries retrieved successfully",
      bookingEntries
    );
  } catch (error) {
    console.log("Get booking entries failed", error);
    return apiResponse.ErrorResponse(res, "Get booking entries failed");
  }
};

exports.getBookingEntriesByDateAndCategory = async (req, res) => {
  try {
    const { booking_date, category } = req.body;
    console.log("booking_date", booking_date);
    console.log("category", category);

    if (!booking_date || !category) {
      return apiResponse.validationErrorWithData(
        res,
        "Date and category are required",
        {}
      );
    }

    const bookingEntries = await BookingEntries.findAll({
      where: {
        category,
        booking_date,
      },
    });
    console.log("bookingEntries============", bookingEntries);

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

exports.getBookingEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingEntry = await BookingEntries.findByPk(id);

    if (!bookingEntry) {
      return apiResponse.notFoundResponse(res, "Booking entry not found");
    }

    return apiResponse.successResponseWithData(
      res,
      "Booking entry retrieved successfully",
      bookingEntry
    );
  } catch (error) {
    console.log("Get booking entry failed", error);
    return apiResponse.ErrorResponse(res, "Get booking entry failed");
  }
};

exports.updateBookingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingEntry = await BookingEntries.findByPk(id);

    if (!bookingEntry) {
      return apiResponse.notFoundResponse(res, "Booking entry not found");
    }

    // Update the entry with the new values
    Object.assign(bookingEntry, req.body);
    await bookingEntry.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking entry updated successfully",
      bookingEntry
    );
  } catch (error) {
    console.log("Update booking entry failed", error);
    return apiResponse.ErrorResponse(res, "Update booking entry failed");
  }
};

exports.deleteBookingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingEntry = await BookingEntries.findByPk(id);

    if (!bookingEntry) {
      return apiResponse.notFoundResponse(res, "Booking entry not found");
    }

    await bookingEntry.destroy();

    return apiResponse.successResponse(
      res,
      "Booking entry deleted successfully"
    );
  } catch (error) {
    console.log("Delete booking entry failed", error);
    return apiResponse.ErrorResponse(res, "Delete booking entry failed");
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingEntry = await BookingEntries.findByPk(id);

    if (!bookingEntry) {
      return apiResponse.notFoundResponse(res, "Booking entry not found");
    }

    bookingEntry.isActive = !bookingEntry.isActive;
    await bookingEntry.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking entry active status updated successfully",
      bookingEntry
    );
  } catch (error) {
    console.log("Toggle active status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle active status failed");
  }
};

exports.toggleDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingEntry = await BookingEntries.findByPk(id);

    if (!bookingEntry) {
      return apiResponse.notFoundResponse(res, "Booking entry not found");
    }

    bookingEntry.isDelete = !bookingEntry.isDelete;
    await bookingEntry.save();

    return apiResponse.successResponseWithData(
      res,
      "Booking entry delete status updated successfully",
      bookingEntry
    );
  } catch (error) {
    console.log("Toggle delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle delete status failed");
  }
};
