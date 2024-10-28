const PostEvents = require('../models/PostEvents');
const apiResponse = require('../helper/apiResponse');

// Add PostEvents with img and title
exports.addPostEvents = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const PostEvents1 = await PostEvents.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'PostEvents added successfully', PostEvents1);
  } catch (error) {
    console.error('Add PostEvents failed', error);
    return apiResponse.ErrorResponse(res, 'Add PostEvents failed');
  }
};

// Update PostEvents with img and title
exports.updatePostEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the PostEvents record by its ID
    const PostEventsRecord = await PostEvents.findByPk(id);
    if (!PostEventsRecord) {
      return apiResponse.notFoundResponse(res, 'PostEvents not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      PostEventsRecord.img = img; // Use the correct variable here
    }
    PostEventsRecord.title = title; // Update the title

    // Save the updated record
    await PostEventsRecord.save();

    return apiResponse.successResponseWithData(res, 'PostEvents updated successfully', PostEventsRecord);
  } catch (error) {
    console.error('Update PostEvents failed', error);
    return apiResponse.ErrorResponse(res, 'Update PostEvents failed');
  }
};


// Get all PostEvents entries
exports.getPostEvents = async (req, res) => {
  try {
    // Determine if this is the find-PostEvents route
    const isFindRoute = req.path === '/find-PostEvents';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }
    
    // Fetch the PostEvents records with the query conditions
    const objectives = await PostEvents.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'PostEvents retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get PostEvents failed', error);
    return apiResponse.ErrorResponse(res, 'Get PostEvents failed');
  }
};


// Toggle isActive status of PostEvents
exports.togglePostEventsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const PostEventsRecord = await PostEvents.findByPk(id);

    // Check if the record exists
    if (!PostEventsRecord) {
      return apiResponse.notFoundResponse(res, 'PostEvents not found');
    }

    // Toggle the active status
    PostEventsRecord.isActive = !PostEventsRecord.isActive;
    await PostEventsRecord.save();

    return apiResponse.successResponseWithData(res, 'PostEvents status updated successfully', PostEventsRecord);
  } catch (error) {
    console.error('Toggle PostEvents status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle PostEvents status failed');
  }
};


// Toggle isDelete status of PostEvents
exports.togglePostEventsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const PostEventsRecord = await PostEvents.findByPk(id);

    // Check if the record exists
    if (!PostEventsRecord) {
      return apiResponse.notFoundResponse(res, 'PostEvents not found');
    }

    // Toggle the delete status
    PostEventsRecord.isDelete = !PostEventsRecord.isDelete;
    await PostEventsRecord.save();

    return apiResponse.successResponseWithData(res, 'PostEvents delete status updated successfully', PostEventsRecord);
  } catch (error) {
    console.error('Toggle PostEvents delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle PostEvents delete status failed');
  }
};

