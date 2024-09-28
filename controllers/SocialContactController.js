const SocialContact = require("../models/SocialContact");
const apiResponse = require("../helper/apiResponse");

exports.addSocialContact = async (req, res) => {
  try {
    const { instagram, facebook, email, whatsapp, linkedin } = req.body;
    const socialContact = await SocialContact.create({
      instagram,
      facebook,
      email,
      whatsapp,
      linkedin,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Social contact added successfully",
      socialContact
    );
  } catch (error) {
    console.log("Add social contact failed", error);
    return apiResponse.ErrorResponse(res, "Add social contact failed");
  }
};

exports.updateSocialContact = async (req, res) => {
  try {
    const { id } = req.params;
    const socialContact = await SocialContact.findByPk(id);
    
    if (!socialContact) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    socialContact.instagram = req.body.instagram;
    socialContact.facebook = req.body.facebook;
    socialContact.email = req.body.email;
    socialContact.whatsapp = req.body.whatsapp;
    socialContact.linkedin = req.body.linkedin;
    await socialContact.save();
    
    return apiResponse.successResponseWithData(
      res,
      "Social contact updated successfully",
      socialContact
    );
  } catch (error) {
    console.log("Update social contact failed", error);
    return apiResponse.ErrorResponse(res, "Update social contact failed");
  }
};

exports.getSocialContact = async (req, res) => {
  try {
    const socialContacts = await SocialContact.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Social contacts retrieved successfully",
      socialContacts
    );
  } catch (error) {
    console.log("Get social contacts failed", error);
    return apiResponse.ErrorResponse(res, "Get social contacts failed");
  }
};

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const socialContact = await SocialContact.findByPk(id);

    if (!socialContact) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    socialContact.isActive = !socialContact.isActive;
    await socialContact.save();

    return apiResponse.successResponseWithData(
      res,
      "Social contact status updated successfully",
      socialContact
    );
  } catch (error) {
    console.log("Toggle social contact status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle social contact status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const socialContact = await SocialContact.findByPk(id);

    if (!socialContact) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    socialContact.isDelete = !socialContact.isDelete;
    await socialContact.save();

    return apiResponse.successResponseWithData(
      res,
      "Social contact delete status updated successfully",
      socialContact
    );
  } catch (error) {
    console.log("Toggle social contact delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle social contact delete status failed");
  }
};
