const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addDirectors,
  updateDirectors,
  toggleDirectorsStatus,
  toggleDirectorsDelete,
  getDirectors,
} = require("../controllers/DirectorsController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new Directors
router.post(
  "/create-Directors",
  authenticateToken,
  uploadSingle,
  addDirectors
);

// Route to update an existing Directors
router.put(
  "/update-Directors/:id",
  authenticateToken,
  uploadSingle,
  updateDirectors
);

// Route to toggle isActive status of Directors
router.put(
  "/Directors-status/:id",
  authenticateToken,
  toggleDirectorsStatus
);

// Route to toggle isDelete status of Directors
router.delete(
  "/Directors-delete/:id",
  authenticateToken,
  toggleDirectorsDelete
);

// Route to get all active PhotoGalleries
router.get("/get-Directors", getDirectors);

// Route to get all active PhotoGalleries
router.get("/find-Directors", authenticateToken, getDirectors);

module.exports = router;
