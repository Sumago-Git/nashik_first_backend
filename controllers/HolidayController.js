const Holiday = require("../models/Holiday");
const apiResponse = require("../helper/apiResponse");

// Add holiday
exports.addHoliday = async (req, res) => {
  try {
    const { holiday_date } = req.body; // Expecting a single string
    const holiday = await Holiday.create({
      holiday_date,
      tempdate: holiday_date,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Holiday added successfully",
      holiday
    );
  } catch (error) {
    console.log("Add holiday failed", error);
    return apiResponse.ErrorResponse(res, "Add holiday failed");
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return apiResponse.notFoundResponse(res, "Holiday not found");
    }

    holiday.holiday_date = req.body.holiday_date; // Update holiday date
    await holiday.save();

    return apiResponse.successResponseWithData(
      res,
      "Holiday updated successfully",
      holiday
    );
  } catch (error) {
    console.log("Update holiday failed", error);
    return apiResponse.ErrorResponse(res, "Update holiday failed");
  }
};

// Get all holidays
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Holidays retrieved successfully",
      holidays
    );
  } catch (error) {
    console.log("Get holidays failed", error);
    return apiResponse.ErrorResponse(res, "Get holidays failed");
  }
};

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return apiResponse.notFoundResponse(res, "Holiday not found");
    }

    holiday.isActive = !holiday.isActive;
    await holiday.save();

    return apiResponse.successResponseWithData(
      res,
      "Holiday status updated successfully",
      holiday
    );
  } catch (error) {
    console.log("Toggle holiday status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle holiday status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { holiday_date } = req.body;

    // Use findOne if holiday_date is not a primary key
    const holiday = await Holiday.findOne({ where: { holiday_date } });

    if (!holiday) {
      return apiResponse.notFoundResponse(res, "Holiday not found");
    }

    // Toggle isDelete status
    holiday.isDelete = !holiday.isDelete;
    await holiday.save();

    return apiResponse.successResponseWithData(
      res,
      "Holiday delete status updated successfully",
      holiday
    );
  } catch (error) {
    console.error("Toggle holiday delete status failed:", error);
    return apiResponse.ErrorResponse(res, "Toggle holiday delete status failed");
  }
};