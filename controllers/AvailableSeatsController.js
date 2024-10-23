const SeatAvailable = require("../models/AvailableSeats");
const apiResponse = require("../helper/apiResponse");

// Add Slot
exports.addAvailability = async (req, res) => {
  try {
    const { seatCount } = req.body;
    const avaialbility = await SeatAvailable.create({
      seatCount,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(res, "avaialbility added successfully", avaialbility);
  } catch (error) {
    console.log("Add avaialbility failed", error);
    return apiResponse.ErrorResponse(res, "Add avaialbility failed");
  }
};

// Update Slot
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const avaialbility = await SeatAvailable.findByPk(id);
    
    if (!avaialbility || avaialbility.isDelete) {
      return apiResponse.notFoundResponse(res, "avaialbility not found");
    }
    
    avaialbility.seatCount = req.body.seatCount
    
    await avaialbility.save();
    

    return apiResponse.successResponseWithData(res, "avaialbility updated successfully", avaialbility);
  } catch (error) {
    console.log("Update avaialbility failed", error);
    return apiResponse.ErrorResponse(res, "Update avaialbility failed");
  }
};

// Get All SeatAvailable
exports.getAvailability = async (req, res) => {
  try {
    const slots = await SeatAvailable.findAll({ where: { isDelete: false } });
    return apiResponse.successResponseWithData(res, "SeatAvailable retrieved successfully", slots);
  } catch (error) {
    console.log("Get slots failed", error);
    return apiResponse.ErrorResponse(res, "Get slots failed");
  }
};

// Toggle isActive status
exports.toggleIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const avaialbility = await SeatAvailable.findByPk(id);

    if (!avaialbility || avaialbility.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    avaialbility.isActive = !avaialbility.isActive;
    await avaialbility.save();

    return apiResponse.successResponseWithData(res, "Slot active status updated", avaialbility);
  } catch (error) {
    console.log("Toggle avaialbility active status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle avaialbility active status failed");
  }
};

// Toggle isDelete status (Soft delete)
exports.toggleIsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const avaialbility = await SeatAvailable.findByPk(id);

    if (!avaialbility || avaialbility.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    avaialbility.isDelete = !avaialbility.isDelete;
    await avaialbility.save();

    return apiResponse.successResponseWithData(res, "avaialbility delete status updated", avaialbility);
  } catch (error) {
    console.log("Toggle avaialbility delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle avaialbility delete status failed");
  }
};
