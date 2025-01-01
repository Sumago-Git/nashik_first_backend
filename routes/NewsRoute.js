const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addNews,
  updateNews,
  toggleNewsStatus,
  toggleNewsDelete,
  getNews,
  getActiveNews, renderNewsDetailPage
} = require("../controllers/NewsController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new News
router.post(
  "/create-news",
  authenticateToken,
  uploadSingle,
  addNews
);

// Route to update an existing News
router.put(
  "/update-news/:id",
  authenticateToken,
  uploadSingle,
  updateNews
);

// Route to toggle isActive status of News
router.put(
  "/news-status/:id",
  authenticateToken,
  toggleNewsStatus
);

// Route to toggle isDelete status of News
router.delete(
  "/news-delete/:id",
  authenticateToken,
  toggleNewsDelete
);

// Route to get all active PhotoGalleries
router.get("/get-news", getActiveNews);

// Route to get all active PhotoGalleries
router.get("/find-news", authenticateToken, getNews);
router.get('/newshmtl/:id', renderNewsDetailPage);
router.get("/news/:id/og", getNewsArticleForOpenGraph);

// Route to fetch full news article by ID
router.get("/news/:id", getNewsArticleById);
module.exports = router;
