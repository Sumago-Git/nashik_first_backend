const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addThanksTo,
  updateThanksTo,
  toggleThanksToStatus,
  toggleThanksToDelete,
  getPhotoGalleries,
  getActivePhotoGalleries,
} = require("../controllers/ThanksToController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new ThanksTo
router.post(
  "/create-ThanksTo",
  authenticateToken,
  uploadSingle,
  addThanksTo
);

// Route to update an existing ThanksTo
router.put(
  "/update-ThanksTo/:id",
  authenticateToken,
  uploadSingle,
  updateThanksTo
);

// Route to toggle isActive status of ThanksTo
router.put(
  "/ThanksTo-status/:id",
  authenticateToken,
  toggleThanksToStatus
);

// Route to toggle isDelete status of ThanksTo
router.delete(
  "/ThanksTo-delete/:id",
  authenticateToken,
  toggleThanksToDelete
);

// Route to get all active PhotoGalleries
router.get("/get-ThanksTo", getActivePhotoGalleries);

// Route to get all active PhotoGalleries
router.get("/find-ThanksTo", authenticateToken, getPhotoGalleries);

module.exports = router;
