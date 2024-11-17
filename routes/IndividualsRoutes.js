const express = require("express");
const {
  addIndividuals,
  getIndividuals,
  isDeleteStatus,
} = require("../controllers/IndividualsController");
const { validationResult } = require("express-validator");
const apiResponse = require("../helper/apiResponse");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Add contact form
router.post("/create-Individuals", (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
  }
  next();
}, addIndividuals);


// Get all contact forms
router.get("/get-Individualss", getIndividuals);



// Toggle contact form delete status (isDelete)
router.delete("/delete-Individuals/:id", authenticateToken, isDeleteStatus);

module.exports = router;