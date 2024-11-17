const Individuals = require("../models/Individuals");
const apiResponse = require("../helper/apiResponse");

exports.addIndividuals = async (req, res) => {
  try {
    const { email, phone, lname, fname, mname, category } = req.body;
    const Individual = await Individuals.create({
      email,
      phone,
      lname, fname, mname, category,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Contact details added successfully",
      Individual
    );
  } catch (error) {
    console.log("Add contact details failed", error);
    return apiResponse.ErrorResponse(res, "Add contact details failed");
  }
};


exports.getIndividuals = async (req, res) => {
  try {
    if (isFindRoute) {
      queryConditions.isActive = true;
    }

    const Individual = await Individuals.findAll();

    // Formatting any image URLs if necessary
    // Assuming there might be an image field to handle
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const IndividualWithBaseUrl = Individual.map(contactDetail => ({
      ...contactDetail.toJSON(),
      img: contactDetail.img ? baseUrl + contactDetail.img.replace(/\\/g, '/') : null,
    }));

    return apiResponse.successResponseWithData(res, 'Contact details retrieved successfully', IndividualWithBaseUrl);
  } catch (error) {
    console.error('Get Contact Details failed', error);
    return apiResponse.ErrorResponse(res, 'Get Contact Details failed');
  }
};



// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const Individual = await Individuals.findByPk(id);

    if (!Individual) {
      return apiResponse.notFoundResponse(res, "Contact details not found");
    }

    Individual.isDelete = !Individual.isDelete;
    await Individual.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact details delete status updated successfully",
      Individual
    );
  } catch (error) {
    console.log("Toggle contact details delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle contact details delete status failed");
  }
};
