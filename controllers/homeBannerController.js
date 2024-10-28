const HomeBanner = require('../models/homeBanner');
const apiResponse = require('../helper/apiResponse');

// Add HomeBanner with bannerweb and bannermob
exports.addHomeBanner = async (req, res) => {
  try {
    const { bannerweb, bannermob } = req.files;

    const homeBanner = await HomeBanner.create({
      bannerweb: bannerweb ? bannerweb[0].path : null,
      bannermob: bannermob ? bannermob[0].path : null,
    });

    return apiResponse.successResponseWithData(res, 'HomeBanner added successfully', homeBanner);
  } catch (error) {
    console.error('Add homeBanner failed', error);
    return apiResponse.ErrorResponse(res, 'Add homeBanner failed');
  }
};

// Update HomeBanner with bannerweb and bannermob
exports.updateHomeBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { bannerweb, bannermob } = req.files;

    const homeBanner = await HomeBanner.findByPk(id);
    if (!homeBanner) {
      return apiResponse.notFoundResponse(res, 'HomeBanner not found');
    }

    homeBanner.bannerweb = bannerweb ? bannerweb[0].path : homeBanner.bannerweb;
    homeBanner.bannermob = bannermob ? bannermob[0].path : homeBanner.bannermob;

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
        bannerweb: homeBanner.bannerweb ? baseUrl + homeBanner.bannerweb.replace(/\\/g, '/') : null,
        bannermob: homeBanner.bannermob ? baseUrl + homeBanner.bannermob.replace(/\\/g, '/') : null,
      }));
  
      return apiResponse.successResponseWithData(res, 'HomeBanners retrieved successfully', homeBannersWithBaseUrl);
    } catch (error) {
      console.error('Get HomeBanners failed', error);
      return apiResponse.ErrorResponse(res, 'Get HomeBanners failed');
    }
  };
  
