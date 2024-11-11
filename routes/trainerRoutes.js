// routes/trainerRoutes.js
const express = require("express");
const {
  addTrainer,
  updateTrainer,
  getTrainers,
  toggleTrainerStatus,
  toggleTrainerDeleteStatus,
} = require("../controllers/TrainerController");
const { validationResult } = require("express-validator");
const apiResponse = require("../helper/apiResponse");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/create-trainer", (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
  }
  next();
}, addTrainer);

router.put("/trainer/:id", authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
  }
  next();
}, updateTrainer);

router.get("/get-trainers", getTrainers);

router.put("/toggle-active-trainer/:id", authenticateToken, toggleTrainerStatus);

router.delete("/toggle-delete-trainer/:id", authenticateToken, toggleTrainerDeleteStatus);

module.exports = router;
