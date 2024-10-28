const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addVideos,
  updateVideos,
  toggleVideosStatus,
  toggleVideosDelete,
  getVideos,
} = require("../controllers/VideosController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new Videos
router.post(
  "/create-Videos",
  authenticateToken,
  uploadSingle,
  addVideos
);

// Route to update an existing Videos
router.put(
  "/update-Videos/:id",
  authenticateToken,
  uploadSingle,
  updateVideos
);

// Route to toggle isActive status of Videos
router.put(
  "/Videos-status/:id",
  authenticateToken,
  toggleVideosStatus
);

// Route to toggle isDelete status of Videos
router.delete(
  "/Videos-delete/:id",
  authenticateToken,
  toggleVideosDelete
);

// Route to get all active PhotoGalleries
router.get("/get-Videos", getVideos);

// Route to get all active PhotoGalleries
router.get("/find-Videos", authenticateToken, getVideos);

module.exports = router;
