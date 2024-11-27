const ThanksTo = require('../models/ThanksTo');
const apiResponse = require('../helper/apiResponse');

// Add ThanksTo with img and title
exports.addThanksTo = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const ThanksTo1 = await ThanksTo.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'ThanksTo added successfully', ThanksTo1);
  } catch (error) {
    console.error('Add ThanksTo failed', error);
    return apiResponse.ErrorResponse(res, 'Add ThanksTo failed');
  }
};

// Update ThanksTo with img and title
exports.updateThanksTo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the ThanksTo record by its ID
    const thanksToRecord = await ThanksTo.findByPk(id);
    if (!thanksToRecord) {
      return apiResponse.notFoundResponse(res, 'ThanksTo not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      thanksToRecord.img = img; // Use the correct variable here
    }
    thanksToRecord.title = title; // Update the title

    // Save the updated record
    await thanksToRecord.save();

    return apiResponse.successResponseWithData(res, 'ThanksTo updated successfully', thanksToRecord);
  } catch (error) {
    console.error('Update ThanksTo failed', error);
    return apiResponse.ErrorResponse(res, 'Update ThanksTo failed');
  }
};


// Get all ThanksTo entries
exports.getPhotoGalleries = async (req, res) => {
  try {
    // Determine if this is the find-photoGalleries route
    const isFindRoute = req.path === '/find-photoGalleries';
    
    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true;
    }
    
    // Fetch the PhotoGalleries with the query conditions
    const photoGalleries = await ThanksTo.findAll({ where: queryConditions });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const photoGalleriesWithBaseUrl = photoGalleries.map(ThanksTo => ({
      ...ThanksTo.toJSON(),
      img: ThanksTo.img ? baseUrl + ThanksTo.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'PhotoGalleries retrieved successfully', photoGalleriesWithBaseUrl);
  } catch (error) {
    console.error('Get PhotoGalleries failed', error);
    return apiResponse.ErrorResponse(res, 'Get PhotoGalleries failed');
  }
};

exports.getActivePhotoGalleries = async (req, res) => {
  try {
    // Fetch only active PhotoGallery records where isDelete is false
    const activePhotoGalleries = await ThanksTo.findAll({
      where: {
        isDelete: false,
        isActive: true, // Only include active photo galleries
      },
    });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const photoGalleriesWithBaseUrl = activePhotoGalleries.map(photoGallery => ({
      ...photoGallery.toJSON(),
      img: photoGallery.img ? baseUrl + photoGallery.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(
      res,
      'Active Photo Galleries retrieved successfully',
      photoGalleriesWithBaseUrl
    );
  } catch (error) {
    console.error('Get Active Photo Galleries failed', error);
    return apiResponse.ErrorResponse(res, 'Get Active Photo Galleries failed');
  }
};



// Toggle isActive status of ThanksTo
exports.toggleThanksToStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const thanksToRecord = await ThanksTo.findByPk(id);

    // Check if the record exists
    if (!thanksToRecord) {
      return apiResponse.notFoundResponse(res, 'ThanksTo not found');
    }

    // Toggle the active status
    thanksToRecord.isActive = !thanksToRecord.isActive;
    await thanksToRecord.save();

    return apiResponse.successResponseWithData(res, 'ThanksTo status updated successfully', thanksToRecord);
  } catch (error) {
    console.error('Toggle ThanksTo status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle ThanksTo status failed');
  }
};


// Toggle isDelete status of ThanksTo
exports.toggleThanksToDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const thanksToRecord = await ThanksTo.findByPk(id);

    // Check if the record exists
    if (!thanksToRecord) {
      return apiResponse.notFoundResponse(res, 'ThanksTo not found');
    }

    // Toggle the delete status
    thanksToRecord.isDelete = !thanksToRecord.isDelete;
    await thanksToRecord.save();

    return apiResponse.successResponseWithData(res, 'ThanksTo delete status updated successfully', thanksToRecord);
  } catch (error) {
    console.error('Toggle ThanksTo delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle ThanksTo delete status failed');
  }
};

