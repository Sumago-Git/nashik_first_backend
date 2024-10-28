const Upcomming = require('../models/Upcomming');
const apiResponse = require('../helper/apiResponse');

// Add a new Upcomming entry
exports.addUpcomming = async (req, res) => {
  try {
    const { purpose, fromdate, todate, area } = req.body;
    const img = req.file ? req.file.path : null; // Use req.file for the uploaded image

    const newUpcomming = await Upcomming.create({
      img,
      purpose,
      fromdate,
      todate,
      area,
    });

    return apiResponse.successResponseWithData(res, 'Upcomming entry added successfully', newUpcomming);
  } catch (error) {
    console.error('Add Upcomming failed', error);
    return apiResponse.ErrorResponse(res, 'Add Upcomming failed');
  }
};

// Update an Upcomming entry
exports.updateUpcomming = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, fromdate, todate, area } = req.body;
    const img = req.file ? req.file.path : null;

    const upcommingRecord = await Upcomming.findByPk(id);
    if (!upcommingRecord) {
      return apiResponse.notFoundResponse(res, 'Upcomming entry not found');
    }

    // Update fields only if they are provided
    if (img) {
      upcommingRecord.img = img;
    }
    upcommingRecord.purpose = purpose || upcommingRecord.purpose;
    upcommingRecord.fromdate = fromdate || upcommingRecord.fromdate;
    upcommingRecord.todate = todate || upcommingRecord.todate;
    upcommingRecord.area = area || upcommingRecord.area;

    await upcommingRecord.save();

    return apiResponse.successResponseWithData(res, 'Upcomming entry updated successfully', upcommingRecord);
  } catch (error) {
    console.error('Update Upcomming failed', error);
    return apiResponse.ErrorResponse(res, 'Update Upcomming failed');
  }
};

// Get all Upcomming entries
exports.getUpcommingEntries = async (req, res) => {
  try {
    const queryConditions = { isDelete: false };

    // If this is the find route, filter for active entries
    const isFindRoute = req.path === '/find-upcomming';
    if (isFindRoute) {
      queryConditions.isActive = true;
    }

    const upcommingEntries = await Upcomming.findAll({ where: queryConditions });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const formattedEntries = upcommingEntries.map(entry => ({
      ...entry.toJSON(),
      img: entry.img ? baseUrl + entry.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Upcomming entries retrieved successfully', formattedEntries);
  } catch (error) {
    console.error('Get Upcomming entries failed', error);
    return apiResponse.ErrorResponse(res, 'Get Upcomming entries failed');
  }
};

// Toggle isActive status of Upcomming
exports.toggleUpcommingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const upcommingRecord = await Upcomming.findByPk(id);

    if (!upcommingRecord) {
      return apiResponse.notFoundResponse(res, 'Upcomming entry not found');
    }

    upcommingRecord.isActive = !upcommingRecord.isActive;
    await upcommingRecord.save();

    return apiResponse.successResponseWithData(res, 'Upcomming status updated successfully', upcommingRecord);
  } catch (error) {
    console.error('Toggle Upcomming status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Upcomming status failed');
  }
};

// Toggle isDelete status of Upcomming
exports.toggleUpcommingDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const upcommingRecord = await Upcomming.findByPk(id);

    if (!upcommingRecord) {
      return apiResponse.notFoundResponse(res, 'Upcomming entry not found');
    }

    upcommingRecord.isDelete = !upcommingRecord.isDelete;
    await upcommingRecord.save();

    return apiResponse.successResponseWithData(res, 'Upcomming delete status updated successfully', upcommingRecord);
  } catch (error) {
    console.error('Toggle Upcomming delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle Upcomming delete status failed');
  }
};
