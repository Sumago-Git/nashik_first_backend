const Sessionslot = require("../models/sesssionslot");
const apiResponse = require("../helper/apiResponse");

// Add Slot

exports.addSessionslot = async (req, res) => {
  try {
    const { time, title, capacity, deadlineTime, trainer, category, slotdate } = req.body;
    const slot = await Sessionslot.create({
      time,
      title, capacity, deadlineTime, trainer, category, slotdate,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(res, "Slot added successfully", slot);
  } catch (error) {
    console.log("Add slot failed", error);
    return apiResponse.ErrorResponse(res, "Add slot failed");
  }
};

exports.updateSessionslot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }
    slot.slotdate = req.body.slotdate;
    slot.time = req.body.time;
    slot.category = req.body.category;
    slot.trainer = req.body.trainer;
    slot.deadlineTime = req.body.deadlineTime;
    slot.capacity = req.body.capacity;
    slot.title = req.body.title,

      await slot.save();

    return apiResponse.successResponseWithData(res, "Slot updated successfully", slot);
  } catch (error) {
    console.log("Update slot failed", error);
    return apiResponse.ErrorResponse(res, "Update slot failed");
  }
};

// Get All Sessionslot
exports.getSessionSessionslot = async (req, res) => {
  try {
    const sessionslot = await Sessionslot.findAll({ where: { isDelete: false } });
    return apiResponse.successResponseWithData(res, "Sessionslot retrieved successfully", sessionslot);
  } catch (error) {
    console.log("Get Sessionslot failed", error);
    return apiResponse.ErrorResponse(res, "Get Sessionslot failed");
  }
};

// Toggle isActive status
exports.toggleIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

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
    const slot = await Sessionslot.findByPk(id);

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

// Get Sessionslots by Category
exports.getSessionslotsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const sessionslots = await Sessionslot.findAll({
      where: {
        category,
        isDelete: false
      }
    });

    if (!sessionslots || sessionslots.length === 0) {
      return apiResponse.notFoundResponse(res, "No session slots found for this category");
    }

    return apiResponse.successResponseWithData(res, "Sessionslots retrieved successfully by category", sessionslots);
  } catch (error) {
    console.log("Get Sessionslots by category failed", error);
    return apiResponse.ErrorResponse(res, "Get Sessionslots by category failed");
  }
};
