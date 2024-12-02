const ObjectiveOfANF = require('../models/ObjectiveOfANF');
const apiResponse = require('../helper/apiResponse');

// Add ObjectiveOfANF with img and title
exports.addObjectiveOfANF = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const ObjectiveOfANF1 = await ObjectiveOfANF.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'ObjectiveOfANF added successfully', ObjectiveOfANF1);
  } catch (error) {
    console.error('Add ObjectiveOfANF failed', error);
    return apiResponse.ErrorResponse(res, 'Add ObjectiveOfANF failed');
  }
};

// Update ObjectiveOfANF with img and title
exports.updateObjectiveOfANF = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the ObjectiveOfANF record by its ID
    const ObjectiveOfANFRecord = await ObjectiveOfANF.findByPk(id);
    if (!ObjectiveOfANFRecord) {
      return apiResponse.notFoundResponse(res, 'ObjectiveOfANF not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      ObjectiveOfANFRecord.img = img; // Use the correct variable here
    }
    ObjectiveOfANFRecord.title = title; // Update the title

    // Save the updated record
    await ObjectiveOfANFRecord.save();

    return apiResponse.successResponseWithData(res, 'ObjectiveOfANF updated successfully', ObjectiveOfANFRecord);
  } catch (error) {
    console.error('Update ObjectiveOfANF failed', error);
    return apiResponse.ErrorResponse(res, 'Update ObjectiveOfANF failed');
  }
};


// Get all ObjectiveOfANF entries
exports.getObjectiveOfANF = async (req, res) => {
  try {
    // Determine if this is the find-objectiveOfANF route
    const isFindRoute = req.path === '/find-objectiveOfANF';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }
    
    // Fetch the ObjectiveOfANF records with the query conditions
    const objectives = await ObjectiveOfANF.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'Objectives retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get ObjectiveOfANF failed', error);
    return apiResponse.ErrorResponse(res, 'Get ObjectiveOfANF failed');
  }
};

// Get all ObjectiveOfANF entries
exports.getIsActiveObjectiveOfANF = async (req, res) => {
  try {
    // Build the query conditions to include only active and non-deleted objectives
    const queryConditions = { isDelete: false, isActive: true };

    // Fetch the ObjectiveOfANF records with the query conditions
    const objectives = await ObjectiveOfANF.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'Active objectives retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get ObjectiveOfANF failed', error);
    return apiResponse.ErrorResponse(res, 'Get ObjectiveOfANF failed');
  }
};


// Toggle isActive status of ObjectiveOfANF
exports.toggleObjectiveOfANFStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ObjectiveOfANFRecord = await ObjectiveOfANF.findByPk(id);

    // Check if the record exists
    if (!ObjectiveOfANFRecord) {
      return apiResponse.notFoundResponse(res, 'ObjectiveOfANF not found');
    }

    // Toggle the active status
    ObjectiveOfANFRecord.isActive = !ObjectiveOfANFRecord.isActive;
    await ObjectiveOfANFRecord.save();

    return apiResponse.successResponseWithData(res, 'ObjectiveOfANF status updated successfully', ObjectiveOfANFRecord);
  } catch (error) {
    console.error('Toggle ObjectiveOfANF status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle ObjectiveOfANF status failed');
  }
};


// Toggle isDelete status of ObjectiveOfANF
exports.toggleObjectiveOfANFDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const ObjectiveOfANFRecord = await ObjectiveOfANF.findByPk(id);

    // Check if the record exists
    if (!ObjectiveOfANFRecord) {
      return apiResponse.notFoundResponse(res, 'ObjectiveOfANF not found');
    }

    // Toggle the delete status
    ObjectiveOfANFRecord.isDelete = !ObjectiveOfANFRecord.isDelete;
    await ObjectiveOfANFRecord.save();

    return apiResponse.successResponseWithData(res, 'ObjectiveOfANF delete status updated successfully', ObjectiveOfANFRecord);
  } catch (error) {
    console.error('Toggle ObjectiveOfANF delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle ObjectiveOfANF delete status failed');
  }
};

