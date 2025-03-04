// controllers/NotificationController.js
const Notification = require("../models/Notification");
const apiResponse = require("../helper/apiResponse");

exports.addNotification = async (req, res) => {
  try {
    const { name } = req.body;
    const notification = await Notification.create({ name });
    return apiResponse.successResponseWithData(
      res,
      "Notification added successfully",
      notification
    );
  } catch (error) {
    console.error("Add notification failed", error);
    return apiResponse.ErrorResponse(res, "Add notification failed");
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return apiResponse.notFoundResponse(res, "Notification not found");
    }

    notification.name = req.body.name;
    await notification.save();

    return apiResponse.successResponseWithData(
      res,
      "Notification updated successfully",
      notification
    );
  } catch (error) {
    console.error("Update notification failed", error);
    return apiResponse.ErrorResponse(res, "Update notification failed");
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notification = await Notification.findAll({
      where: { isDelete: false },
    });
    return apiResponse.successResponseWithData(
      res,
      "Notification retrieved successfully",
      notification
    );
  } catch (error) {
    console.error("Get notification failed", error);
    return apiResponse.ErrorResponse(res, "Get notification failed");
  }
};

exports.toggleNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return apiResponse.notFoundResponse(res, "Notification not found");
    }

    notification.isActive = !notification.isActive;
    await notification.save();

    return apiResponse.successResponseWithData(
      res,
      "Notification status updated successfully",
      notification
    );
  } catch (error) {
    console.error("Toggle notification status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle notification status failed");
  }
};

exports.toggleNotificationDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return apiResponse.notFoundResponse(res, "Notification not found");
    }

    notification.isDelete = !notification.isDelete;
    await notification.save();

    return apiResponse.successResponseWithData(
      res,
      "Notification delete status updated successfully",
      notification
    );
  } catch (error) {
    console.error("Toggle notification delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle notification delete status failed");
  }
};
