const Directors = require('../models/Directors');
const apiResponse = require('../helper/apiResponse');

// Add Directors with img and name
exports.addDirectors = async (req, res) => {
  try {
    const { designation, name } = req.body;

    const Directors1 = await Directors.create({
      designation: designation,
      name: name,
    });

    return apiResponse.successResponseWithData(res, 'Directors added successfully', Directors1);
  } catch (error) {
    console.error('Add Directors failed', error);
    return apiResponse.ErrorResponse(res, 'Add Directors failed');
  }
};

// Update Directors with img and name
exports.updateDirectors = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation } = req.body;

    // Fetch the Directors record by its ID
    const DirectorsRecord = await Directors.findByPk(id);
    if (!DirectorsRecord) {
      return apiResponse.notFoundResponse(res, 'Directors not found');
    }

    // Only update img if a new file is uploaded

    DirectorsRecord.name = name; // Update the name
    designation.name = designation;
    // Save the updated record
    await DirectorsRecord.save();

    return apiResponse.successResponseWithData(res, 'Directors updated successfully', DirectorsRecord);
  } catch (error) {
    console.error('Update Directors failed', error);
    return apiResponse.ErrorResponse(res, 'Update Directors failed');
  }
};


// Get all Directors entries
exports.getDirectors = async (req, res) => {
  try {
    // Determine if this is the find-Directors route
    const isFindRoute = req.path === '/find-Directors';

    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }

    // Fetch the Directors records with the query conditions
    const objectives = await Directors.findAll({ where: queryConditions });

    // Construct the base URL for image paths


    return apiResponse.successResponseWithData(res, 'Directors retrieved successfully', objectives);
  } catch (error) {
    console.error('Get Directors failed', error);
    return apiResponse.ErrorResponse(res, 'Get Directors failed');
  }
};


// Toggle isActive status of Directors
exports.toggleDirectorsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const DirectorsRecord = await Directors.findByPk(id);

    // Check if the record exists
    if (!DirectorsRecord) {
      return apiResponse.notFoundResponse(res, 'Directors not found');
    }

    // Toggle the active status
    DirectorsRecord.isActive = !DirectorsRecord.isActive;
    await DirectorsRecord.save();

    return apiResponse.successResponseWithData(res, 'Directors status updated successfully', DirectorsRecord);
  } catch (error) {
    console.error('Toggle Directors status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Directors status failed');
  }
};


// Toggle isDelete status of Directors
exports.toggleDirectorsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const DirectorsRecord = await Directors.findByPk(id);

    // Check if the record exists
    if (!DirectorsRecord) {
      return apiResponse.notFoundResponse(res, 'Directors not found');
    }

    // Toggle the delete status
    DirectorsRecord.isDelete = !DirectorsRecord.isDelete;
    await DirectorsRecord.save();

    return apiResponse.successResponseWithData(res, 'Directors delete status updated successfully', DirectorsRecord);
  } catch (error) {
    console.error('Toggle Directors delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Directors delete status failed');
  }
};

