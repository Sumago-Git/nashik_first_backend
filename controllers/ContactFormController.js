const ContactForm = require("../models/ContactForm");
const apiResponse = require("../helper/apiResponse");
const sendEmail = require("../middleware/nodemailer");
exports.addContactForm = async (req, res) => {
  try {
    const {
      firstName,
      email,
      contact,
      age,
      subject,
      profession,
      suggestions,
    } = req.body;

    console.log("req.body.suggestionfile", req.body.suggestionfile);

    // Extract the path starting from '/uploads'
    const suggestionFilePath = req.body.suggestionfile
      ? req.body.suggestionfile.split("\\uploads").pop().replace(/\\/g, "/")
      : null;

    const contactForm = await ContactForm.create({
      firstName,
      email,
      contact,
      age,
      subject,
      profession,
      suggestions,
      suggestionfile: suggestionFilePath ? `uploads${suggestionFilePath}` : null,
      isActive: true,
      isDelete: false,
    });

    // Email logic
    const adminEmail = process.env.EMAIL_SENT_TO;
    const emailSubject = "New Contact Form Submission";
    const emailHtml = `<p>A new contact form has been submitted:</p>
    <ul>
      <li><strong>Name:</strong> ${firstName}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Contact:</strong> ${contact}</li>
      <li><strong>Age:</strong> ${age}</li>
      <li><strong>Subject:</strong> ${subject}</li>
      <li><strong>Profession:</strong> ${profession}</li>
      <li><strong>Suggestions:</strong> ${suggestions}</li>
    </ul>`;
    await sendEmail(adminEmail, emailSubject, "", emailHtml);

    return apiResponse.successResponseWithData(
      res,
      "Contact form submitted successfully and email sent to the admin",
      contactForm
    );
  } catch (error) {
    console.error("Error while adding contact form:", error);
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

    // Update fields
    contactForm.firstName = req.body.firstName || contactForm.firstName;
    contactForm.email = req.body.email || contactForm.email;
    contactForm.contact = req.body.contact || contactForm.contact;
    contactForm.age = req.body.age || contactForm.age;
    contactForm.subject = req.body.subject || contactForm.subject;
    contactForm.profession = req.body.profession || contactForm.profession;
    contactForm.suggestions = req.body.suggestions || contactForm.suggestions;

    // Update file path if new file is uploaded
    if (req.body.suggestionfile) {
      contactForm.suggestionfile = req.body.suggestionfile;
    }

    await contactForm.save();

    return apiResponse.successResponseWithData(
      res,
      "Contact form updated successfully",
      contactForm
    );
  } catch (error) {
    console.error("Error while updating contact form:", error);
    return apiResponse.ErrorResponse(res, "Update Contact Form failed");
  }
};


exports.getContactForms = async (req, res) => {
  try {
    const contactForms = await ContactForm.findAll({
      where: { isDelete: false },
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const updatedContactForms = contactForms.map((form) => {
      const data = form.toJSON(); // Convert Sequelize instance to plain object
      return {
        ...data,
        suggestionfile: data.suggestionfile
          ? `${baseUrl}/${data.suggestionfile.replace(/\\/g, "/")}` // Normalize the file path
          : null, // Handle undefined or null suggestionfile
      };
    });

    return apiResponse.successResponseWithData(
      res,
      "Contact forms retrieved successfully",
      updatedContactForms
    );
  } catch (error) {
    console.error("Get Contact Forms failed", error);
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
    return apiResponse.ErrorResponse(
      res,
      "Toggle contact form delete status failed"
    );
  }
};
