const ContactForm = require("../models/ContactForm");
const apiResponse = require("../helper/apiResponse");

exports.addContactForm = async (req, res) => {
  try {
    const { firstName, email, contact, age, subject, profession, suggestions } = req.body;
    const contactForm = await ContactForm.create({
      firstName,
      email,
      contact,
      age,
      subject,
      profession,
      suggestions,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(
      res,
      "Contact form submitted successfully",
      contactForm
    );
  } catch (error) {
    console.log("Add Contact Form failed", error);
    return apiResponse.ErrorResponse(res, "Add Contact Form failed");
  }
};

exports.updateContactForm = async (req, res) => {
  try {
    const { id } = req.params;
    const contactForm = await ContactForm.findByPk(id);

    if (!contactForm) {
      return apiResponse.notFoundResponse(res, "Contact form not found");
    }

    contactForm.firstName = req.body.firstName;
    contactForm.email = req.body.email;
    contactForm.contact = req.body.contact;
    contactForm.age = req.body.age;
    contactForm.subject = req.body.subject;
    contactForm.profession = req.body.profession;
    contactForm.suggestions = req.body.suggestions;
    await contactForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact form updated successfully",
      contactForm
    );
  } catch (error) {
    console.log("Update Contact Form failed", error);
    return apiResponse.ErrorResponse(res, "Update Contact Form failed");
  }
};

exports.getContactForms = async (req, res) => {
  try {
    const contactForms = await ContactForm.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Contact forms retrieved successfully",
      contactForms
    );
  } catch (error) {
    console.log("Get Contact Forms failed", error);
    return apiResponse.ErrorResponse(res, "Get Contact Forms failed");
  }
};

// Toggle isActive status
exports.isActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const contactForm = await ContactForm.findByPk(id);

    if (!contactForm) {
      return apiResponse.notFoundResponse(res, "Contact form not found");
    }

    contactForm.isActive = !contactForm.isActive;
    await contactForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact form status updated successfully",
      contactForm
    );
  } catch (error) {
    console.log("Toggle contact form status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle contact form status failed");
  }
};

// Toggle isDelete status
exports.isDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const contactForm = await ContactForm.findByPk(id);

    if (!contactForm) {
      return apiResponse.notFoundResponse(res, "Contact form not found");
    }

    contactForm.isDelete = !contactForm.isDelete;
    await contactForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact form delete status updated successfully",
      contactForm
    );
  } catch (error) {
    console.log("Toggle contact form delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle contact form delete status failed");
  }
};