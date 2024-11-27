const HomeBanner = require('../models/homeBanner');
const apiResponse = require('../helper/apiResponse');

// Add HomeBanner with img1 and img2
exports.addHomeBanner = async (req, res) => {
  try {
    const { img1, img2 } = req.files;

    const homeBanner = await HomeBanner.create({
      img1: img1 ? img1[0].path : null,
      img2: img2 ? img2[0].path : null,
    });

    return apiResponse.successResponseWithData(res, 'HomeBanner added successfully', homeBanner);
  } catch (error) {
    console.error('Add homeBanner failed', error);
    return apiResponse.ErrorResponse(res, 'Add homeBanner failed');
  }
};

// Update HomeBanner with img1 and img2
exports.updateHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { img1, img2 } = req.files;

    const homeBanner = await HomeBanner.findByPk(id);
    if (!homeBanner) {
      return apiResponse.notFoundResponse(res, 'HomeBanner not found');
    }

    homeBanner.img1 = img1 ? img1[0].path : homeBanner.img1;
    homeBanner.img2 = img2 ? img2[0].path : homeBanner.img2;

    await homeBanner.save();

    return apiResponse.successResponseWithData(res, 'HomeBanner updated successfully', homeBanner);
  } catch (error) {
    console.error('Update homeBanner failed', error);
    return apiResponse.ErrorResponse(res, 'Update homeBanner failed');
  }
};

// Toggle isActive status of HomeBanner
exports.toggleHomeBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const homeBanner = await HomeBanner.findByPk(id);

    if (!homeBanner) {
      return apiResponse.notFoundResponse(res, 'HomeBanner not found');
    }

    homeBanner.isActive = !homeBanner.isActive;
    await homeBanner.save();

    return apiResponse.successResponseWithData(res, 'HomeBanner status updated successfully', homeBanner);
  } catch (error) {
    console.error('Toggle HomeBanner status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle HomeBanner status failed');
  }
};

// Toggle isDelete status of HomeBanner
exports.toggleHomeBannerDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const homeBanner = await HomeBanner.findByPk(id);

    if (!homeBanner) {
      return apiResponse.notFoundResponse(res, 'HomeBanner not found');
    }

    homeBanner.isDelete = !homeBanner.isDelete;
    await homeBanner.save();

    return apiResponse.successResponseWithData(res, 'HomeBanner delete status updated successfully', homeBanner);
  } catch (error) {
    console.error('Toggle HomeBanner delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle HomeBanner delete status failed');
  }
};

// Get all active HomeBanners
exports.getHomeBanners = async (req, res) => {
    try {
      // Determine if this is the find-homeBanners route
      const isFindRoute = req.path === '/find-homeBanners';
      
      // Build the query conditions
      const queryConditions = { isDelete: false };
      if (isFindRoute) {
        queryConditions.isActive = true;
      }
      
      // Fetch the HomeBanners with the query conditions
      const homeBanners = await HomeBanner.findAll({ where: queryConditions });
  
      const baseUrl = `${req.protocol}://${req.get('host')}/`;
      const homeBannersWithBaseUrl = homeBanners.map(homeBanner => ({
        ...homeBanner.toJSON(),
        img1: homeBanner.img1 ? baseUrl + homeBanner.img1.replace(/\\/g, '/') : null,
        img2: homeBanner.img2 ? baseUrl + homeBanner.img2.replace(/\\/g, '/') : null,
      }));
  
      return apiResponse.successResponseWithData(res, 'HomeBanners retrieved successfully', homeBannersWithBaseUrl);
    } catch (error) {
      console.error('Get HomeBanners failed', error);
      return apiResponse.ErrorResponse(res, 'Get HomeBanners failed');
    }
  };
  
  exports.getActiveHomeBanners = async (req, res) => {
    try {
      // Build the query conditions for active entries
      const queryConditions = { isActive: true, isDelete: false };
  
      // Fetch the active HomeBanners
      const activeHomeBanners = await HomeBanner.findAll({ where: queryConditions });
  
      const baseUrl = `${req.protocol}://${req.get('host')}/`;
      const activeHomeBannersWithBaseUrl = activeHomeBanners.map(homeBanner => ({
        ...homeBanner.toJSON(),
        img1: homeBanner.img1 ? baseUrl + homeBanner.img1.replace(/\\/g, '/') : null,
        img2: homeBanner.img2 ? baseUrl + homeBanner.img2.replace(/\\/g, '/') : null,
      }));
  
      return apiResponse.successResponseWithData(res, 'Active HomeBanners retrieved successfully', activeHomeBannersWithBaseUrl);
    } catch (error) {
      console.error('Get Active HomeBanners failed', error);
      return apiResponse.ErrorResponse(res, 'Get Active HomeBanners failed');
    }
  };