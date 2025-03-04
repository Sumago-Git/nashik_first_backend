// routes/NotificationRoutes.js
const express = require("express");
const {
    addNotification,
    updateNotification,
    getNotifications,
    toggleNotificationStatus,
    toggleNotificationDeleteStatus,
} = require("../controllers/NotificationController");
const { validationResult } = require("express-validator");
const apiResponse = require("../helper/apiResponse");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/create-notification", (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
    }
    next();
}, addNotification);

router.put("/notification/:id", authenticateToken, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error", errors.array());
    }
    next();
}, updateNotification);

router.get("/get-notification", getNotifications);

router.put("/toggle-active-notification/:id", authenticateToken, toggleNotificationStatus);

router.delete("/toggle-delete-notification/:id", authenticateToken, toggleNotificationDeleteStatus);

module.exports = router;
