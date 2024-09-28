const Office = require('../models/Office');
const apiResponse = require('../helper/apiResponse');

exports.addOffice = async (req, res) => {
  try {
    const { title, address, phone, email } = req.body;
    const img = req.file ? req.file.path : null;

    const office = await Office.create({ img, title, address, phone, email, isActive: true, isDelete: false });
    return apiResponse.successResponseWithData(res, 'Office added successfully', office);
  } catch (error) {
    console.error('Add office failed', error);
    return apiResponse.ErrorResponse(res, 'Add office failed');
  }
};

exports.updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, phone, email } = req.body;
    const img = req.file ? req.file.path : null;

    const office = await Office.findByPk(id);
    if (!office) {
      return apiResponse.notFoundResponse(res, 'Office not found');
    }

    office.title = title;
    office.address = address;
    office.phone = phone;
    office.email = email;
    office.img = img || office.img;
    await office.save();

    return apiResponse.successResponseWithData(res, 'Office updated successfully', office);
  } catch (error) {
    console.error('Update office failed', error);
    return apiResponse.ErrorResponse(res, 'Update office failed');
  }
};

exports.getOffices = async (req, res) => {
  try {
    const offices = await Office.findAll({ where: { isDelete: false } });

    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const officesWithBaseUrl = offices.map(office => {
      return {
        ...office.toJSON(),
        img: office.img ? baseUrl + office.img.replace(/\\/g, '/') : null
      };
    });

    return apiResponse.successResponseWithData(res, 'Offices retrieved successfully', officesWithBaseUrl);
  } catch (error) {
    console.error('Get offices failed', error);
    return apiResponse.ErrorResponse(res, 'Get offices failed');
  }
};

exports.toggleOfficeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const office = await Office.findByPk(id);

    if (!office) {
      return apiResponse.notFoundResponse(res, 'Office not found');
    }

    office.isActive = !office.isActive;
    await office.save();

    return apiResponse.successResponseWithData(res, 'Office status updated successfully', office);
  } catch (error) {
    console.error('Toggle office status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle office status failed');
  }
};

exports.toggleOfficeDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const office = await Office.findByPk(id);

    if (!office) {
      return apiResponse.notFoundResponse(res, 'Office not found');
    }

    office.isDelete = !office.isDelete;
    await office.save();

    return apiResponse.successResponseWithData(res, 'Office delete status updated successfully', office);
  } catch (error) {
    console.error('Toggle office delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle office delete status failed');
  }
};
