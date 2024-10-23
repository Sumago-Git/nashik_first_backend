const Slots = require("../models/Slots");
const apiResponse = require("../helper/apiResponse");

// Add Slot
exports.addSlot = async (req, res) => {
  try {
    const { time, sessions } = req.body;
    const slot = await Slots.create({
      time,
      sessions,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(res, "Slot added successfully", slot);
  } catch (error) {
    console.log("Add slot failed", error);
    return apiResponse.ErrorResponse(res, "Add slot failed");
  }
};

// Update Slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slots.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    slot.time = req.body.time;
    slot.sessions = req.body.sessions;
    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot updated successfully", slot);
  } catch (error) {
    console.log("Update slot failed", error);
    return apiResponse.ErrorResponse(res, "Update slot failed");
  }
};

// Get All Slots
exports.getSlots = async (req, res) => {
  try {
    const slots = await Slots.findAll({ where: { isDelete: false } });
    return apiResponse.successResponseWithData(res, "Slots retrieved successfully", slots);
  } catch (error) {
    console.log("Get slots failed", error);
    return apiResponse.ErrorResponse(res, "Get slots failed");
  }
};

// Toggle isActive status
exports.toggleIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slots.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    slot.isActive = !slot.isActive;
    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot active status updated", slot);
  } catch (error) {
    console.log("Toggle slot active status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle slot active status failed");
  }
};

// Toggle isDelete status (Soft delete)
exports.toggleIsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slots.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    slot.isDelete = !slot.isDelete;
    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot delete status updated", slot);
  } catch (error) {
    console.log("Toggle slot delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle slot delete status failed");
  }
};
