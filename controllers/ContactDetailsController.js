const ContactDetails = require("../models/ContactDetails");
const apiResponse = require("../helper/apiResponse");

exports.addContactDetails = async (req, res) => {
  try {
    const { email, phone, address, whatsapp } = req.body;
    const contactDetails = await ContactDetails.create({
      email,
      phone,
      address,
      whatsapp,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Contact details added successfully",
      contactDetails
    );
  } catch (error) {
    console.log("Add contact details failed", error);
    return apiResponse.ErrorResponse(res, "Add contact details failed");
  }
};

exports.updateContactDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const contactDetails = await ContactDetails.findByPk(id);
    
    if (!contactDetails) {
      return apiResponse.notFoundResponse(res, "Contact details not found");
    }

    contactDetails.email = req.body.email;
    contactDetails.phone = req.body.phone;
    contactDetails.address = req.body.address;
    contactDetails.whatsapp = req.body.whatsapp;
    await contactDetails.save();
    
    return apiResponse.successResponseWithData(
      res,
      "Contact details updated successfully",
      contactDetails
    );
  } catch (error) {
    console.log("Update contact details failed", error);
    return apiResponse.ErrorResponse(res, "Update contact details failed");
  }
};

exports.getContactDetails = async (req, res) => {
    try {
      const isFindRoute = req.path === '/find-contactdetails';
      const queryConditions = { isDelete: false };
      
      if (isFindRoute) {
        queryConditions.isActive = true;
      }
  
      const contactDetails = await ContactDetails.findAll({ where: queryConditions });
  
      // Formatting any image URLs if necessary
      // Assuming there might be an image field to handle
      const baseUrl = `${req.protocol}://${req.get('host')}/`;
      const contactDetailsWithBaseUrl = contactDetails.map(contactDetail => ({
        ...contactDetail.toJSON(),
        img: contactDetail.img ? baseUrl + contactDetail.img.replace(/\\/g, '/') : null,
      }));
  
      return apiResponse.successResponseWithData(res, 'Contact details retrieved successfully', contactDetailsWithBaseUrl);
    } catch (error) {
      console.error('Get Contact Details failed', error);
      return apiResponse.ErrorResponse(res, 'Get Contact Details failed');
    }
  };
  

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const contactDetails = await ContactDetails.findByPk(id);

    if (!contactDetails) {
      return apiResponse.notFoundResponse(res, "Contact details not found");
    }

    contactDetails.isActive = !contactDetails.isActive;
    await contactDetails.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact details status updated successfully",
      contactDetails
    );
  } catch (error) {
    console.log("Toggle contact details status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle contact details status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const contactDetails = await ContactDetails.findByPk(id);

    if (!contactDetails) {
      return apiResponse.notFoundResponse(res, "Contact details not found");
    }

    contactDetails.isDelete = !contactDetails.isDelete;
    await contactDetails.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact details delete status updated successfully",
      contactDetails
    );
  } catch (error) {
    console.log("Toggle contact details delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle contact details delete status failed");
  }
};
