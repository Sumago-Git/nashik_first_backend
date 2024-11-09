const { body, param } = require("express-validator");

exports.validateBookingEntry = [
  body("user_id").isInt().withMessage("User ID must be an integer"),
  body("status").isString().withMessage("Status is required"),
  body("booking_date").isISO8601().withMessage("Booking date must be a valid date"),
  body("submission_date").isISO8601().withMessage("Submission date must be a valid date"),
  body("fname").isString().withMessage("First name is required"),
  body("lname").isString().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("phone").isString().withMessage("Phone number is required"),
  body("vehicle_type").isString().withMessage("Vehicle type is required"),
];

exports.validateBookingEntryId = [
  param("id").isInt().withMessage("BookingEntry ID must be an integer"),
];
