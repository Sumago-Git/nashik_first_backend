const express = require("express");
const {
  addContactForm,
  updateContactForm,
  getContactForms,
  isActiveStatus,
  isDeleteStatus,
} = require("../controllers/ContactFormController");
const { validationResult } = require("express-validator");
const apiResponse = require("../helper/apiResponse");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Add contact form
router.post("/create-contactform", (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
  }
  next();
}, addContactForm);

// Update contact form
router.put("/update-contactform/:id", authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
  }
  next();
}, updateContactForm);

// Get all contact forms
router.get("/get-contactforms", getContactForms);

// Toggle contact form status (isActive)
router.put("/isactive-contactform/:id", authenticateToken, isActiveStatus);

// Toggle contact form delete status (isDelete)
router.delete("/delete-contactform/:id", authenticateToken, isDeleteStatus);

module.exports = router;