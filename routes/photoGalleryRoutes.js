const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addPhotoGallery,
  updatePhotoGallery,
  togglePhotoGalleryStatus,
  togglePhotoGalleryDelete,
  getPhotoGalleries,
} = require("../controllers/photoGalleryController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new PhotoGallery
router.post(
  "/create-photoGallery",
  authenticateToken,
  uploadSingle,
  addPhotoGallery
);

// Route to update an existing PhotoGallery
router.put(
  "/update-photoGallery/:id",
  authenticateToken,
  uploadSingle,
  updatePhotoGallery
);

// Route to toggle isActive status of PhotoGallery
router.put(
  "/photoGallery-status/:id",
  authenticateToken,
  togglePhotoGalleryStatus
);

// Route to toggle isDelete status of PhotoGallery
router.delete(
  "/photoGallery-delete/:id",
  authenticateToken,
  togglePhotoGalleryDelete
);

// Route to get all active PhotoGalleries
router.get("/get-photoGalleries", getPhotoGalleries);

// Route to get all active PhotoGalleries
router.get("/find-photoGalleries", authenticateToken, getPhotoGalleries);

module.exports = router;
