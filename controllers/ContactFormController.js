const ContactForm = require("../models/ContactForm");
const apiResponse = require("../helper/apiResponse");
const sendEmail = require("../middleware/nodemailer");
exports.addContactForm = async (req, res) => {
  try {
    const { firstName, email, contact, age, subject, profession, suggestions } = req.body;

    // Create the contact form
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

    // Prepare the email content for the admin
    const adminEmail = process.env.EMAIL_SENT_TO; // Replace with your admin's email address
    const emailSubject = "New Contact Form Submission";
    const emailText = `A new contact form has been submitted:

    Name: ${firstName}
    Email: ${email}
    Contact: ${contact}
    Age: ${age}
    Subject: ${subject}
    Profession: ${profession}
    Suggestions: ${suggestions}
`;

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

    // Send the email to the admin
    await sendEmail(adminEmail, emailSubject, emailText, emailHtml);

    // Log a message to the console to confirm email sent
    console.log(`Email sent successfully to ${adminEmail} with the contact form details.`);

    return apiResponse.successResponseWithData(
      res,
      "Contact form submitted successfully and email sent to the admin",
      contactForm
    );
  } catch (error) {
    // Log the error if sending the email fails
    console.log("Error while sending email: ", error);

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