const Holiday = require("../models/Holiday");
const apiResponse = require("../helper/apiResponse");
const SessionSlot = require("../models/sesssionslot")
// Add holiday
exports.addHoliday = async (req, res) => {
  try {
    const { holiday_date, tempdate } = req.body; // Expecting a single string

    // Check if holiday_date exists in SessionSlot table as slotdate
    const sessionSlotExists = await SessionSlot.findOne({
      where: { slotdate: holiday_date },
    });

    if (sessionSlotExists) {
      return apiResponse.ErrorResponse(
        res,
        "Cannot add holiday. A session slot is already scheduled on this date."
      );
    }

    // Proceed to add holiday if no session slot exists for the given date
    const holiday = await Holiday.create({
      holiday_date,
      tempdate: tempdate,
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
    const { holiday_date, tempdate } = req.body;  // Get both holiday_date and tempdate from the request body

    // Find the holiday by ID
    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return apiResponse.notFoundResponse(res, "Holiday not found");
    }

    // Check if the new holiday_date exists in the SessionSlot table as slotdate
    const sessionSlotExists = await SessionSlot.findOne({
      where: { slotdate: holiday_date },
    });

    if (sessionSlotExists) {
      return apiResponse.ErrorResponse(
        res,
        "Cannot update holiday. A session slot is already scheduled on this date."
      );
    }

    // Proceed with updating both holiday_date and tempdate
    holiday.holiday_date = holiday_date;  // Update holiday date
    holiday.tempdate = tempdate;  // Update tempdate
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

    // Attempt to delete the record(s) matching the given holiday_date
    const deletedCount = await Holiday.destroy({
      where: { holiday_date },
    });

    if (deletedCount === 0) {
      return apiResponse.notFoundResponse(res, "No holiday found with the given date");
    }

    return apiResponse.successResponse(
      res,
      `Holiday with date ${holiday_date} deleted successfully`
    );
  } catch (error) {
    console.error("Delete holiday failed:", error);
    return apiResponse.ErrorResponse(res, "Delete holiday failed");
  }
};
