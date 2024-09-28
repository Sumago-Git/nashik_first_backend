const Supporter = require('../models/supporter');
const apiResponse = require('../helper/apiResponse');

// Add Supporter with img
exports.addSupporter = async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return apiResponse.ErrorResponse(res, 'Image upload failed or no file was provided');
    }

    const supporter = await Supporter.create({
      img: file.path,
    });

    return apiResponse.successResponseWithData(res, 'Supporter added successfully', supporter);
  } catch (error) {
    console.error('Add Supporter failed', error);
    return apiResponse.ErrorResponse(res, 'Add Supporter failed');
  }
};

exports.updateSupporter = async (req, res) => {
    try {
      const { id } = req.params; // Get ID from URL parameters
      const { file } = req; // Get uploaded file
  
      // Log the incoming data for debugging
      console.log(`Updating Supporter with ID: ${id}`);
      console.log(`Uploaded file:`, file);
  
      const supporter = await Supporter.findByPk(id); // Find the supporter by primary key
      if (!supporter) {
        console.log('Supporter not found');
        return apiResponse.notFoundResponse(res, 'Supporter not found'); // Handle not found
      }
  
      // Update the supporter record
      supporter.img = file ? file.path : supporter.img;
  
      await supporter.save(); // Save the changes to the database
  
      return apiResponse.successResponseWithData(res, 'Supporter updated successfully', supporter); // Success response
    } catch (error) {
      console.error('Update Supporter failed', error);
      return apiResponse.ErrorResponse(res, 'Update Supporter failed'); // Error response
    }
  };

// Toggle isActive status of Supporter
exports.toggleSupporterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const supporter = await Supporter.findByPk(id);

    if (!supporter) {
      return apiResponse.notFoundResponse(res, 'Supporter not found');
    }

    supporter.isActive = !supporter.isActive;
    await supporter.save();

    return apiResponse.successResponseWithData(res, 'Supporter status updated successfully', supporter);
  } catch (error) {
    console.error('Toggle Supporter status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Supporter status failed');
  }
};

// Toggle isDelete status of Supporter
exports.toggleSupporterDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const supporter = await Supporter.findByPk(id);

    if (!supporter) {
      return apiResponse.notFoundResponse(res, 'Supporter not found');
    }

    supporter.isDelete = !supporter.isDelete;
    await supporter.save();

    return apiResponse.successResponseWithData(res, 'Supporter delete status updated successfully', supporter);
  } catch (error) {
    console.error('Toggle Supporter delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Supporter delete status failed');
  }
};

// Get all active Supporters
exports.getSupporters = async (req, res) => {
  try {
    const isFindRoute = req.path === '/find-supporters';
    const queryConditions = { isDelete: false };
    
    if (isFindRoute) {
      queryConditions.isActive = true;
    }

    const supporters = await Supporter.findAll({ where: queryConditions });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const supportersWithBaseUrl = supporters.map(supporter => ({
      ...supporter.toJSON(),
      img: supporter.img ? baseUrl + supporter.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Supporters retrieved successfully', supportersWithBaseUrl);
  } catch (error) {
    console.error('Get Supporters failed', error);
    return apiResponse.ErrorResponse(res, 'Get Supporters failed');
  }
};
