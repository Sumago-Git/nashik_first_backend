const { body, param } = require("express-validator");

exports.validatehomeyoutube = [
  body("mediaurl")
    .isString()
    .withMessage("mediaurl must be a string"),
  body("title")
    .isString()
    .withMessage("title must be a string"),
];

exports.validatehomeyoutubeId = [
  param("id").isInt().withMessage("home counter ID must be an integer"),
];
