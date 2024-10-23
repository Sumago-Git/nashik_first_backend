const homeyoutube = require("../models/homeyoutube");
const apiResponse = require("../helper/apiResponse");

exports.addhomeyoutube = async (req, res) => {
  try {
    const { mediaurl, title} = req.body;
    const homeyoutube = await homeyoutube.create({
      mediaurl,
      title,     
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "home youtube added successfully",
      homeyoutube
    );
  } catch (error) {
    console.log("Add home youtube failed", error);
    return apiResponse.ErrorResponse(res, "Add home youtube failed");
  }
};

exports.updatehomeyoutube = async (req, res) => {
  try {
    const { id } = req.params;
    const homeyoutube = await homeyoutube.findByPk(id);
    
    if (!homeyoutube) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    homeyoutube.mediaurl = req.body.mediaurl;
    homeyoutube.title = req.body.title;

    await homeyoutube.save();
    
    return apiResponse.successResponseWithData(
      res,
      "home youtube updated successfully",
      homeyoutube
    );
  } catch (error) {
    console.log("Update home youtube failed", error);
    return apiResponse.ErrorResponse(res, "Update home youtube failed");
  }
};

exports.gethomeyoutube = async (req, res) => {
  try {
    const homeyoutube = await homeyoutube.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "home youtube retrieved successfully",
      homeyoutube
    );
  } catch (error) {
    console.log("Get home youtube failed", error);
    return apiResponse.ErrorResponse(res, "Get home youtube failed");
  }
};

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const homeyoutube = await homeyoutube.findByPk(id);

    if (!homeyoutube) {
      return apiResponse.notFoundResponse(res, "home youtube not found");
    }

    homeyoutube.isActive = !homeyoutube.isActive;
    await homeyoutube.save();

    return apiResponse.successResponseWithData(
      res,
      "home youtube status updated successfully",
      homeyoutube
    );
  } catch (error) {
    console.log("Toggle home youtube status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home youtube status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the homeyoutube by its primary key
    const homeyoutube = await homeyoutube.findByPk(id);

    if (!homeyoutube) {
      return apiResponse.notFoundResponse(res, "home youtube not found");
    }

    // Toggle the isDelete status
    homeyoutube.isDelete = !homeyoutube.isDelete;

    // Save the updated homeyoutube
    await homeyoutube.save();

    // Respond with success message and updated homeyoutube object
    return apiResponse.successResponseWithData(
      res,
      "home youtube delete status updated successfully",
      homeyoutube
    );
  } catch (error) {
    console.log("Toggle home youtube delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home youtube delete status failed");
  }
};
