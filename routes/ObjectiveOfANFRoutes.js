const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addObjectiveOfANF,
  updateObjectiveOfANF,
  toggleObjectiveOfANFStatus,
  toggleObjectiveOfANFDelete,
  getObjectiveOfANF,
  getIsActiveObjectiveOfANF,
} = require("../controllers/ObjectiveOfANFController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new ObjectiveOfANF
router.post(
  "/create-ObjectiveOfANF",
  authenticateToken,
  uploadSingle,
  addObjectiveOfANF
);

// Route to update an existing ObjectiveOfANF
router.put(
  "/update-ObjectiveOfANF/:id",
  authenticateToken,
  uploadSingle,
  updateObjectiveOfANF
);

// Route to toggle isActive status of ObjectiveOfANF
router.put(
  "/ObjectiveOfANF-status/:id",
  authenticateToken,
  toggleObjectiveOfANFStatus
);

// Route to toggle isDelete status of ObjectiveOfANF
router.delete(
  "/ObjectiveOfANF-delete/:id",
  authenticateToken,
  toggleObjectiveOfANFDelete
);

// Route to get all active PhotoGalleries
router.get("/get-ObjectiveOfANF", getIsActiveObjectiveOfANF);

// Route to get all active PhotoGalleries
router.get("/find-ObjectiveOfANF", authenticateToken, getObjectiveOfANF);

module.exports = router;
