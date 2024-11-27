const PhotoGallery = require('../models/photoGallery');
const apiResponse = require('../helper/apiResponse');

// Add PhotoGallery with img and title
exports.addPhotoGallery = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const photoGallery = await PhotoGallery.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'PhotoGallery added successfully', photoGallery);
  } catch (error) {
    console.error('Add PhotoGallery failed', error);
    return apiResponse.ErrorResponse(res, 'Add PhotoGallery failed');
  }
};

// Update PhotoGallery with img and title
exports.updatePhotoGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    const photoGallery = await PhotoGallery.findByPk(id);
    if (!photoGallery) {
      return apiResponse.notFoundResponse(res, 'PhotoGallery not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      photoGallery.img = img;
    }
    photoGallery.title = title;

    await photoGallery.save();

    return apiResponse.successResponseWithData(res, 'PhotoGallery updated successfully', photoGallery);
  } catch (error) {
    console.error('Update PhotoGallery failed', error);
    return apiResponse.ErrorResponse(res, 'Update PhotoGallery failed');
  }
};

// Get all PhotoGallery entries
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
    const photoGalleries = await PhotoGallery.findAll({ where: queryConditions });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const photoGalleriesWithBaseUrl = photoGalleries.map(photoGallery => ({
      ...photoGallery.toJSON(),
      img: photoGallery.img ? baseUrl + photoGallery.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'PhotoGalleries retrieved successfully', photoGalleriesWithBaseUrl);
  } catch (error) {
    console.error('Get PhotoGalleries failed', error);
    return apiResponse.ErrorResponse(res, 'Get PhotoGalleries failed');
  }
};

// Toggle isActive status of PhotoGallery
exports.togglePhotoGalleryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const photoGallery = await PhotoGallery.findByPk(id);

    if (!photoGallery) {
      return apiResponse.notFoundResponse(res, 'PhotoGallery not found');
    }

    photoGallery.isActive = !photoGallery.isActive;
    await photoGallery.save();

    return apiResponse.successResponseWithData(res, 'PhotoGallery status updated successfully', photoGallery);
  } catch (error) {
    console.error('Toggle PhotoGallery status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle PhotoGallery status failed');
  }
};

// Toggle isDelete status of PhotoGallery
exports.togglePhotoGalleryDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const photoGallery = await PhotoGallery.findByPk(id);

    if (!photoGallery) {
      return apiResponse.notFoundResponse(res, 'PhotoGallery not found');
    }

    photoGallery.isDelete = !photoGallery.isDelete;
    await photoGallery.save();

    return apiResponse.successResponseWithData(res, 'PhotoGallery delete status updated successfully', photoGallery);
  } catch (error) {
    console.error('Toggle PhotoGallery delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle PhotoGallery delete status failed');
  }
};
exports.getActivePhotoGalleries = async (req, res) => {
  try {
    // Build the query conditions for active entries
    const queryConditions = { isActive: true, isDelete: false };

    // Fetch the active PhotoGalleries
    const activePhotoGalleries = await PhotoGallery.findAll({ where: queryConditions });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const activePhotoGalleriesWithBaseUrl = activePhotoGalleries.map(photoGallery => ({
      ...photoGallery.toJSON(),
      img: photoGallery.img ? baseUrl + photoGallery.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Active PhotoGalleries retrieved successfully', activePhotoGalleriesWithBaseUrl);
  } catch (error) {
    console.error('Get Active PhotoGalleries failed', error);
    return apiResponse.ErrorResponse(res, 'Get Active PhotoGalleries failed');
  }
};
