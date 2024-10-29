const Videos = require('../models/Videos');
const apiResponse = require('../helper/apiResponse');

// Add Videos with img and title
exports.addVideos = async (req, res) => {
  try {
    const { title,mediaurl } = req.body;

    const Videos1 = await Videos.create({
      mediaurl: mediaurl,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'Videos added successfully', Videos1);
  } catch (error) {
    console.error('Add Videos failed', error);
    return apiResponse.ErrorResponse(res, 'Add Videos failed');
  }
};

// Update Videos with img and title
exports.updateVideos  = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, mediaurl } = req.body;

    // Fetch the Videos record by its ID
    const VideosRecord = await Videos.findByPk(id);
    if (!VideosRecord) {
      return apiResponse.notFoundResponse(res, 'Videos not found');
    }

    // Update the title and mediaurl only if they are provided
    if (title) {
      VideosRecord.title = title; // Update the title if provided
    }
    if (mediaurl) {
      VideosRecord.mediaurl = mediaurl; // Update the mediaurl if provided
    }

    // Save the updated record
    await VideosRecord.save();

    return apiResponse.successResponseWithData(res, 'Videos updated successfully', VideosRecord);
  } catch (error) {
    console.error('Update Videos failed', error);
    return apiResponse.ErrorResponse(res, 'Update Videos failed');
  }
};


// Get all Videos entries
exports.getVideos = async (req, res) => {
  try {
    // Determine if this is the find-Videos route
    const isFindRoute = req.path === '/find-Videos';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }
    
    // Fetch the Videos records with the query conditions
    const objectives = await Videos.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    

    return apiResponse.successResponseWithData(res, 'Videos retrieved successfully', objectives);
  } catch (error) {
    console.error('Get Videos failed', error);
    return apiResponse.ErrorResponse(res, 'Get Videos failed');
  }
};


// Toggle isActive status of Videos
exports.toggleVideosStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const VideosRecord = await Videos.findByPk(id);

    // Check if the record exists
    if (!VideosRecord) {
      return apiResponse.notFoundResponse(res, 'Videos not found');
    }

    // Toggle the active status
    VideosRecord.isActive = !VideosRecord.isActive;
    await VideosRecord.save();

    return apiResponse.successResponseWithData(res, 'Videos status updated successfully', VideosRecord);
  } catch (error) {
    console.error('Toggle Videos status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Videos status failed');
  }
};


// Toggle isDelete status of Videos
exports.toggleVideosDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const VideosRecord = await Videos.findByPk(id);

    // Check if the record exists
    if (!VideosRecord) {
      return apiResponse.notFoundResponse(res, 'Videos not found');
    }

    // Toggle the delete status
    VideosRecord.isDelete = !VideosRecord.isDelete;
    await VideosRecord.save();

    return apiResponse.successResponseWithData(res, 'Videos delete status updated successfully', VideosRecord);
  } catch (error) {
    console.error('Toggle Videos delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Videos delete status failed');
  }
};

