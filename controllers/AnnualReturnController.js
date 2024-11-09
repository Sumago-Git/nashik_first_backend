const AnnualReturn = require('../models/AnnualReturn');
const apiResponse = require('../helper/apiResponse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Multer storage and file filter configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/annualreturn';
    // Check if the directory exists; if not, create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Appends the original file extension
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only PDF files are allowed!'), false); // Reject files that are not PDFs
  }
};

// Initialize Multer with the defined storage, file filter, and limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: fileFilter
}).single('file'); // 'file' should match the field name in the form submission

// Create a new Annual Report (POST)
exports.addAnnualReturn = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return apiResponse.ErrorResponse(res, `Upload Error: ${err.message}`);
    } else if (err) {
      return apiResponse.ErrorResponse(res, `Upload Error: ${err.message}`);
    }

    try {
      const { financialYear } = req.body;
      const file = req.file ? req.file.path : null;

      const report = await AnnualReturn.create({
        file: file,
        financialYear: financialYear,
      });

      return apiResponse.successResponseWithData(res, 'Annual Report added successfully', report);
    } catch (error) {
      console.error('Add Annual Report failed', error);
      return apiResponse.ErrorResponse(res, 'Add Annual Report failed');
    }
  });
};

exports.updateAnnualReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { financialYear } = req.body;

    const report = await AnnualReturn.findByPk(id);
    if (!report) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    if (req.file) {
      report.file = req.file.path; // Update the file path if a new file is uploaded
    }

    report.financialYear = financialYear; // Update the financial year
    await report.save();

    return apiResponse.successResponseWithData(res, 'Annual Report updated successfully', report);
  } catch (error) {
    console.error('Update Annual Report failed', error);
    return apiResponse.ErrorResponse(res, 'Update Annual Report failed');
  }
};
// Get all Annual Reports (GET)
exports.getAnnualReturns = async (req, res) => {
  try {
    const reports = await AnnualReturn.findAll({
      where: { isDelete: false },
    });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const reportsWithBaseUrl = reports.map(report => ({
      ...report.toJSON(),
      file: report.file ? baseUrl + report.file.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Annual Reports retrieved successfully', reportsWithBaseUrl);
  } catch (error) {
    console.error('Get Annual Reports failed', error);
    return apiResponse.ErrorResponse(res, 'Get Annual Reports failed');
  }
};

// Get all active Annual Reports (GET)
exports.getActiveAnnualReturns = async (req, res) => {
  try {
    const reports = await AnnualReturn.findAll({
      where: { isDelete: false, isActive: true },
    });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const reportsWithBaseUrl = reports.map(report => ({
      ...report.toJSON(),
      file: report.file ? baseUrl + report.file.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Active Annual Reports retrieved successfully', reportsWithBaseUrl);
  } catch (error) {
    console.error('Get Active Annual Reports failed', error);
    return apiResponse.ErrorResponse(res, 'Get Active Annual Reports failed');
  }
};

// Toggle isActive status of Annual Report (PUT)
exports.toggleAnnualReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await AnnualReturn.findByPk(id);

    if (!report) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    report.isActive = !report.isActive;
    await report.save();

    return apiResponse.successResponseWithData(res, 'Annual Report status updated successfully', report);
  } catch (error) {
    console.error('Toggle Annual Report status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Annual Report status failed');
  }
};

// Toggle isDelete status of Annual Report (DELETE)
exports.toggleAnnualReturnDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await AnnualReturn.findByPk(id);

    if (!report) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    report.isDelete = !report.isDelete;
    await report.save();

    return apiResponse.successResponseWithData(res, 'Annual Report delete status updated successfully', report);
  } catch (error) {
    console.error('Toggle Annual Report delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Annual Report delete status failed');
  }
};
