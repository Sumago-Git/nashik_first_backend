const Homeyoutube = require("../models/homeyoutube");
const apiResponse = require("../helper/apiResponse");

exports.addhomeyoutube = async (req, res) => {
  try {
    const Homeyoutube = require("../models/homeyoutube");
    const { title, mediaurl } = req.body;
    const Homeyoutube1 = await Homeyoutube.create({
      title,
      mediaurl,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Home Counter added successfully",
      Homeyoutube1
    );
  } catch (error) {
    console.log("Add Home Counter failed", error);
    return apiResponse.ErrorResponse(res, "Add Home Counter failed");
  }
};

exports.updatehomeyoutube = async (req, res) => {
  try {
    const { id } = req.params;
    const homeyoutubeInstance = await Homeyoutube.findByPk(id);

    // Check if the instance was found
    if (!homeyoutubeInstance) {
      return apiResponse.notFoundResponse(res, "Home counter not found");
    }

    // Update fields
    homeyoutubeInstance.title = req.body.title;
    homeyoutubeInstance.mediaurl = req.body.mediaurl;

    // Save the updated instance
    await homeyoutubeInstance.save();

    // Return success response
    return apiResponse.successResponseWithData(
      res,
      "Home Counter updated successfully",
      homeyoutubeInstance
    );
  } catch (error) {
    console.log("Update Home Counter failed", error);
    return apiResponse.ErrorResponse(res, "Update Home Counter failed");
  }
};


exports.gethomeyoutube = async (req, res) => {
  try {
    const Homeyoutube1 = await Homeyoutube.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "home counter retrieved successfully",
      Homeyoutube1
    );
  } catch (error) {
    console.log("Get home counter failed", error);
    return apiResponse.ErrorResponse(res, "Get home counter failed");
  }
};

exports.getActiveHomeYoutube = async (req, res) => {
  try {
    // Fetch records where isDelete is false and isActive is true
    const activeHomeYoutubeRecords = await Homeyoutube.findAll({
      where: {
        isDelete: false,
        isActive: true,
      },
    });

    return apiResponse.successResponseWithData(
      res,
      "Active Home YouTube records retrieved successfully",
      activeHomeYoutubeRecords
    );
  } catch (error) {
    console.log("Get Active Home YouTube records failed", error);
    return apiResponse.ErrorResponse(res, "Get Active Home YouTube records failed");
  }
};


exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const homeYoutube = await Homeyoutube.findByPk(id); // Updated naming for consistency.

    if (!homeYoutube) {
      return apiResponse.notFoundResponse(res, "Home counter not found");
    }

    // Toggle the isActive status
    homeYoutube.isActive = !homeYoutube.isActive;
    await homeYoutube.save(); // Save the updated object

    return apiResponse.successResponseWithData(
      res,
      "Home counter status updated successfully",
      homeYoutube
    );
  } catch (error) {
    console.error("Toggle home counter status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home counter status failed");
  }
};



// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Homeyoutube by its primary key
    const homeyoutubeInstance = await Homeyoutube.findByPk(id);

    // Check if the instance was found
    if (!homeyoutubeInstance) {
      return apiResponse.notFoundResponse(res, "Home counter not found");
    }

    // Toggle the isDelete status
    homeyoutubeInstance.isDelete = !homeyoutubeInstance.isDelete;

    // Save the updated Homeyoutube instance
    await homeyoutubeInstance.save();

    // Respond with success message and updated Homeyoutube object
    return apiResponse.successResponseWithData(
      res,
      "Home counter delete status updated successfully",
      homeyoutubeInstance
    );
  } catch (error) {
    console.log("Toggle home counter delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle home counter delete status failed");
  }
};
