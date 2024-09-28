const { body, param } = require("express-validator");

exports.validateHomeCounter = [
  body("training_imparted")
    .isString()
    .withMessage("training_imparted must be a string"),
  body("lives_changed")
    .isString()
    .withMessage("lives_changed must be a string"),
  body("children")
    .isString() // Added isString validation for children
    .withMessage("children must be a string"),
  body("adult")
    .isString()
    .withMessage("adult must be a string"),
];

exports.validateHomeCounterId = [
  param("id").isInt().withMessage("home counter ID must be an integer"),
];
