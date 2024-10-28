const AnnualReturn = require("../models/AnnualReturn");
const apiResponse = require("../helper/apiResponse");

// Add new annual report
exports.addAnnualReturn = async (req, res) => {
  try {
    const { label, links } = req.body;
    const annualReturn = await AnnualReturn.create({
      label,
      links,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Annual report added successfully",
      annualReturn
    );
  } catch (error) {
    console.log("Add annual report failed", error);
    return apiResponse.ErrorResponse(res, "Add annual report failed");
  }
};

// Update annual report
exports.updateAnnualReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReturn = await AnnualReturn.findByPk(id);

    if (!annualReturn) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    AnnualReturn.label = req.body.label;
    AnnualReturn.links = req.body.links;
    await annualReturn.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report updated successfully",
      annualReturn
    );
  } catch (error) {
    console.log("Update annual report failed", error);
    return apiResponse.ErrorResponse(res, "Update annual report failed");
  }
};

// Get all annual reports
exports.getAnnualReturns = async (req, res) => {
  try {
    const AnnualReturns = await AnnualReturn.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Annual reports retrieved successfully",
      AnnualReturns
    );
  } catch (error) {
    console.log("Get annual reports failed", error);
    return apiResponse.ErrorResponse(res, "Get annual reports failed");
  }
};

// Toggle isActive status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const AnnualReturn = await AnnualReturn.findByPk(id);

    if (!AnnualReturn) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    AnnualReturn.isActive = !AnnualReturn.isActive;
    await AnnualReturn.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report status updated successfully",
      AnnualReturn
    );
  } catch (error) {
    console.log("Toggle active status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle active status failed");
  }
};

// Toggle isDelete status
exports.toggleDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const AnnualReturn = await AnnualReturn.findByPk(id);

    if (!AnnualReturn) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    AnnualReturn.isDelete = !AnnualReturn.isDelete;
    await AnnualReturn.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report delete status updated successfully",
      AnnualReturn
    );
  } catch (error) {
    console.log("Toggle delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle delete status failed");
  }
};