const AnnualReport = require("../models/AnnualReport");
const apiResponse = require("../helper/apiResponse");

// Add new annual report
exports.addAnnualReport = async (req, res) => {
  try {
    const { label, links } = req.body;
    const annualReport = await AnnualReport.create({
      label,
      links,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Annual report added successfully",
      annualReport
    );
  } catch (error) {
    console.log("Add annual report failed", error);
    return apiResponse.ErrorResponse(res, "Add annual report failed");
  }
};

// Update annual report
exports.updateAnnualReport = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    annualReport.label = req.body.label;
    annualReport.links = req.body.links;
    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report updated successfully",
      annualReport
    );
  } catch (error) {
    console.log("Update annual report failed", error);
    return apiResponse.ErrorResponse(res, "Update annual report failed");
  }
};

// Get all annual reports
exports.getAnnualReports = async (req, res) => {
  try {
    const annualReports = await AnnualReport.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Annual reports retrieved successfully",
      annualReports
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
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    annualReport.isActive = !annualReport.isActive;
    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report status updated successfully",
      annualReport
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
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, "Annual report not found");
    }

    annualReport.isDelete = !annualReport.isDelete;
    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      "Annual report delete status updated successfully",
      annualReport
    );
  } catch (error) {
    console.log("Toggle delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle delete status failed");
  }
};
