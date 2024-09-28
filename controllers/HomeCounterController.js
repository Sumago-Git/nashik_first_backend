const HomeCounter = require("../models/HomeCounter");
const apiResponse = require("../helper/apiResponse");

exports.addHomeCounter = async (req, res) => {
  try {
    const { training_imparted, lives_changed, children, adult } = req.body;
    const homeCounter = await HomeCounter.create({
      training_imparted,
      lives_changed,
      children,
      adult,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Home Counter added successfully",
      homeCounter
    );
  } catch (error) {
    console.log("Add Home Counter failed", error);
    return apiResponse.ErrorResponse(res, "Add Home Counter failed");
  }
};

exports.updateHomeCounter = async (req, res) => {
  try {
    const { id } = req.params;
    const homeCounter = await HomeCounter.findByPk(id);
    
    if (!homeCounter) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    homeCounter.training_imparted = req.body.training_imparted;
    homeCounter.lives_changed = req.body.lives_changed;
    homeCounter.children = req.body.children;
    homeCounter.adult = req.body.adult;
    await homeCounter.save();
    
    return apiResponse.successResponseWithData(
      res,
      "Home Counter updated successfully",
      homeCounter
    );
  } catch (error) {
    console.log("Update Home Counter failed", error);
    return apiResponse.ErrorResponse(res, "Update Home Counter failed");
  }
};

exports.getHomeCounter = async (req, res) => {
  try {
    const homeCounter = await HomeCounter.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "home counter retrieved successfully",
      homeCounter
    );
  } catch (error) {
    console.log("Get home counter failed", error);
    return apiResponse.ErrorResponse(res, "Get home counter failed");
  }
};

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const homeCounter = await HomeCounter.findByPk(id);

    if (!homeCounter) {
      return apiResponse.notFoundResponse(res, "home counter not found");
    }

    homeCounter.isActive = !homeCounter.isActive;
    await homeCounter.save();

    return apiResponse.successResponseWithData(
      res,
      "home counter status updated successfully",
      homeCounter
    );
  } catch (error) {
    console.log("Toggle home counter status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home counter status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the HomeCounter by its primary key
    const homeCounter = await HomeCounter.findByPk(id);

    if (!homeCounter) {
      return apiResponse.notFoundResponse(res, "Home counter not found");
    }

    // Toggle the isDelete status
    homeCounter.isDelete = !homeCounter.isDelete;

    // Save the updated homeCounter
    await homeCounter.save();

    // Respond with success message and updated homeCounter object
    return apiResponse.successResponseWithData(
      res,
      "Home counter delete status updated successfully",
      homeCounter
    );
  } catch (error) {
    console.log("Toggle home counter delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home counter delete status failed");
  }
};
