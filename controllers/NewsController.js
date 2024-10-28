const News = require('../models/News');
const apiResponse = require('../helper/apiResponse');

// Add News with img and title
exports.addNews = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const News1 = await News.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'News added successfully', News1);
  } catch (error) {
    console.error('Add News failed', error);
    return apiResponse.ErrorResponse(res, 'Add News failed');
  }
};

// Update News with img and title
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the News record by its ID
    const NewsRecord = await News.findByPk(id);
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      NewsRecord.img = img; // Use the correct variable here
    }
    NewsRecord.title = title; // Update the title

    // Save the updated record
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News updated successfully', NewsRecord);
  } catch (error) {
    console.error('Update News failed', error);
    return apiResponse.ErrorResponse(res, 'Update News failed');
  }
};


// Get all News entries
exports.getNews = async (req, res) => {
  try {
    // Determine if this is the find-News route
    const isFindRoute = req.path === '/find-News';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }
    
    // Fetch the News records with the query conditions
    const objectives = await News.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'News retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get News failed', error);
    return apiResponse.ErrorResponse(res, 'Get News failed');
  }
};


// Toggle isActive status of News
exports.toggleNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const NewsRecord = await News.findByPk(id);

    // Check if the record exists
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Toggle the active status
    NewsRecord.isActive = !NewsRecord.isActive;
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News status updated successfully', NewsRecord);
  } catch (error) {
    console.error('Toggle News status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle News status failed');
  }
};


// Toggle isDelete status of News
exports.toggleNewsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const NewsRecord = await News.findByPk(id);

    // Check if the record exists
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Toggle the delete status
    NewsRecord.isDelete = !NewsRecord.isDelete;
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News delete status updated successfully', NewsRecord);
  } catch (error) {
    console.error('Toggle News delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle News delete status failed');
  }
};

