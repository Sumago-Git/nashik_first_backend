const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addSupporter,
  updateSupporter,
  toggleSupporterStatus,
  toggleSupporterDelete,
  getSupporters,
} = require("../controllers/supporterController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new Supporter
router.post(
  "/create-supporter",
  authenticateToken,
  uploadSingle,
  addSupporter
);

// Route to update an existing Supporter
router.put(
  "/update-supporter/:id",
  authenticateToken,
  uploadSingle,
  updateSupporter
);

// Route to toggle isActive status of Supporter
router.put(
  "/supporter-status/:id",
  authenticateToken,
  toggleSupporterStatus
);

// Route to toggle isDelete status of Supporter
router.delete(
  "/supporter-delete/:id",
  authenticateToken,
  toggleSupporterDelete
);

// Route to get all Supporters
router.get("/get-supporters", getSupporters);

// Route to get all active Supporters
router.get("/find-supporters", authenticateToken, getSupporters);

module.exports = router;
