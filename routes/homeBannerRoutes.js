const express = require("express");
const { uploadMultiple } = require("../middleware/multer");
const {
  addHomeBanner,
  updateHomeBanner,
  toggleHomeBannerStatus,
  toggleHomeBannerDelete,
  getHomeBanners,
} = require("../controllers/homeBannerController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new HomeBanner with img1 and img2
router.post(
  "/create-homeBanner",
  authenticateToken,
  uploadMultiple,
  addHomeBanner
);

// Route to update an existing HomeBanner with img1 and img2
router.put(
  "/update-homeBanner/:id",
  authenticateToken,
  uploadMultiple,
  updateHomeBanner
);

// Route to toggle isActive status of HomeBanner
router.put(
  "/homeBanner-status/:id",
  authenticateToken,
  toggleHomeBannerStatus
);

// Route to toggle isDelete status of HomeBanner
router.delete(
  "/homeBanner-delete/:id",
  authenticateToken,
  toggleHomeBannerDelete
);

// Route to get all active HomeBanners
router.get("/get-homeBanners", getHomeBanners);

// Route to get all active HomeBanners
router.get("/find-homeBanners", authenticateToken, getHomeBanners);

module.exports = router;
