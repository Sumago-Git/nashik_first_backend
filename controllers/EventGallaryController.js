const EventGallary = require('../models/EventGallary');
const apiResponse = require('../helper/apiResponse');

// Add EventGallary with img and title
exports.addEventGallary = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const EventGallary1 = await EventGallary.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'EventGallary added successfully', EventGallary1);
  } catch (error) {
    console.error('Add EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Add EventGallary failed');
  }
};

// Update EventGallary with img and title
exports.updateEventGallary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the EventGallary record by its ID
    const EventGallaryRecord = await EventGallary.findByPk(id);
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      EventGallaryRecord.img = img; // Use the correct variable here
    }
    EventGallaryRecord.title = title; // Update the title

    // Save the updated record
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Update EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Update EventGallary failed');
  }
};


// Get all EventGallary entries
exports.getEventGallary = async (req, res) => {
  try {
    // Determine if this is the find-EventGallary route
    const isFindRoute = req.path === '/find-EventGallary';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }
    
    // Fetch the EventGallary records with the query conditions
    const objectives = await EventGallary.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'EventGallary retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Get EventGallary failed');
  }
};


// Toggle isActive status of EventGallary
exports.toggleEventGallaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const EventGallaryRecord = await EventGallary.findByPk(id);

    // Check if the record exists
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Toggle the active status
    EventGallaryRecord.isActive = !EventGallaryRecord.isActive;
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary status updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Toggle EventGallary status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle EventGallary status failed');
  }
};


// Toggle isDelete status of EventGallary
exports.toggleEventGallaryDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const EventGallaryRecord = await EventGallary.findByPk(id);

    // Check if the record exists
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Toggle the delete status
    EventGallaryRecord.isDelete = !EventGallaryRecord.isDelete;
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary delete status updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Toggle EventGallary delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle EventGallary delete status failed');
  }
};

