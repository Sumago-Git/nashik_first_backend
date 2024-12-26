// controllers/TrainerController.js
const Trainer = require("../models/Trainer");
const apiResponse = require("../helper/apiResponse");

exports.addTrainer = async (req, res) => {
  try {
    const { name, mobile, email } = req.body;
    const trainer = await Trainer.create({ name, mobile, email });
    return apiResponse.successResponseWithData(
      res,
      "Trainer added successfully",
      trainer
    );
  } catch (error) {
    console.error("Add trainer failed", error);
    return apiResponse.ErrorResponse(res, "Add trainer failed");
  }
};

exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findByPk(id);

    if (!trainer) {
      return apiResponse.notFoundResponse(res, "Trainer not found");
    }

    trainer.name = req.body.name;
    trainer.mobile = req.body.mobile;
    trainer.email = req.body.email;
    await trainer.save();

    return apiResponse.successResponseWithData(
      res,
      "Trainer updated successfully",
      trainer
    );
  } catch (error) {
    console.error("Update trainer failed", error);
    return apiResponse.ErrorResponse(res, "Update trainer failed");
  }
};

exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      where: { isDelete: false, isActive: true },
    });
    return apiResponse.successResponseWithData(
      res,
      "Trainers retrieved successfully",
      trainers
    );
  } catch (error) {
    console.error("Get trainers failed", error);
    return apiResponse.ErrorResponse(res, "Get trainers failed");
  }
};

exports.toggleTrainerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findByPk(id);

    if (!trainer) {
      return apiResponse.notFoundResponse(res, "Trainer not found");
    }

    trainer.isActive = !trainer.isActive;
    await trainer.save();

    return apiResponse.successResponseWithData(
      res,
      "Trainer status updated successfully",
      trainer
    );
  } catch (error) {
    console.error("Toggle trainer status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle trainer status failed");
  }
};

exports.toggleTrainerDeleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findByPk(id);

    if (!trainer) {
      return apiResponse.notFoundResponse(res, "Trainer not found");
    }

    trainer.isDelete = !trainer.isDelete;
    await trainer.save();

    return apiResponse.successResponseWithData(
      res,
      "Trainer delete status updated successfully",
      trainer
    );
  } catch (error) {
    console.error("Toggle trainer delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle trainer delete status failed");
  }
};
