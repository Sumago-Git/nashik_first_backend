// controllers/SocialContactController.js
const SocialContact = require("../models/SocialContact");
const apiResponse = require("../helper/apiResponse");

exports.addSocialContact = async (req, res) => {
  try {
    const { facebook, instagram, youtube, twitter } = req.body;
    const socialContact = await SocialContact.create({
      facebook,
      instagram,
      youtube,
      twitter,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Social contact added successfully",
      socialContact
    );
  } catch (error) {
    console.log("Add Social Contact failed", error);
    return apiResponse.ErrorResponse(res, "Add Social Contact failed");
  }
};

exports.updateSocialContact = async (req, res) => {
  try {
    const { id } = req.params;
    const socialContact = await SocialContact.findByPk(id);

    if (!socialContact) {
      return apiResponse.notFoundResponse(res, "Social contact not found");
    }

    socialContact.facebook = req.body.facebook;
    socialContact.instagram = req.body.instagram;
    socialContact.youtube = req.body.youtube;
    socialContact.twitter = req.body.twitter;

    await socialContact.save();

    return apiResponse.successResponseWithData(
      res,
      "Social contact updated successfully",
      socialContact
    );
  } catch (error) {
    console.log("Update Social Contact failed", error);
    return apiResponse.ErrorResponse(res, "Update Social Contact failed");
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
    console.log("Get Social Contact failed", error);
    return apiResponse.ErrorResponse(res, "Get Social Contact failed");
  }
};

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
