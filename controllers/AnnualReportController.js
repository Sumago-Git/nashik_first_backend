// /controllers/annualReportController.js

const AnnualReport = require('../models/AnnualReport');
const apiResponse = require('../helper/apiResponse');
const fs = require('fs');
const path = require('path');

// Add Annual Report
exports.addAnnualReport = async (req, res) => {
  try {
    const { financialYear } = req.body;
    let pdfPath = null;

    if (req.file) {
      pdfPath = req.file.path.replace(/\\/g, '/'); // For Windows compatibility
    } else {
      return apiResponse.validationErrorWithData(res, 'Validation Error', [{ msg: 'PDF file is required', param: 'pdf' }]);
    }

    const annualReport = await AnnualReport.create({
      financialYear,
      links: pdfPath,
      isActive: true,
      isDelete: false,
    });

    return apiResponse.successResponseWithData(
      res,
      'Annual Report added successfully',
      annualReport
    );
  } catch (error) {
    console.error('Add Annual Report failed:', error);
    return apiResponse.ErrorResponse(res, 'Add Annual Report failed');
  }
};

// Update Annual Report
exports.updateAnnualReport = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    const { financialYear } = req.body;
    let pdfPath = annualReport.links; // Existing PDF path

    if (req.file) {
      // Optionally, delete the old PDF file from the server
      if (annualReport.links) {
        fs.unlink(path.resolve(annualReport.links), (err) => {
          if (err) console.error('Failed to delete old PDF:', err);
        });
      }
      pdfPath = req.file.path.replace(/\\/g, '/'); // Update to new file path
    }

    // Update fields
    annualReport.financialYear = financialYear;
    annualReport.links = pdfPath;

    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      'Annual Report updated successfully',
      annualReport
    );
  } catch (error) {
    console.error('Update Annual Report failed:', error);
    return apiResponse.ErrorResponse(res, 'Update Annual Report failed');
  }
};

// Get All Annual Reports
exports.getAnnualReports = async (req, res) => {
  try {
    const annualReports = await AnnualReport.findAll({
      where: { isDelete: false },
      order: [['createdAt', 'DESC']],
    });

    return apiResponse.successResponseWithData(
      res,
      'Annual Reports retrieved successfully',
      annualReports
    );
  } catch (error) {
    console.error('Get Annual Reports failed:', error);
    return apiResponse.ErrorResponse(res, 'Get Annual Reports failed');
  }
};

// Toggle isActive Status
exports.toggleIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    annualReport.isActive = !annualReport.isActive;
    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      'Annual Report active status updated successfully',
      annualReport
    );
  } catch (error) {
    console.error('Toggle Annual Report active status failed:', error);
    return apiResponse.ErrorResponse(res, 'Toggle Annual Report active status failed');
  }
};

// Toggle isDelete Status
exports.toggleIsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    annualReport.isDelete = !annualReport.isDelete;
    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      'Annual Report delete status updated successfully',
      annualReport
    );
  } catch (error) {
    console.error('Toggle Annual Report delete status failed:', error);
    return apiResponse.ErrorResponse(res, 'Toggle Annual Report delete status failed');
  }
};
