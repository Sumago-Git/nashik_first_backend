const Sessionslot = require("../models/sesssionslot");
const apiResponse = require("../helper/apiResponse");
const sequelize = require('../config/database'); // Make sure to import sequelize from your DB config file
const Holiday = require("../models/Holiday");
const { Op } = require('sequelize');
const SlotRegisterInfo = require("../models/SlotRegisterInfo");
// Add Slot

// exports.addSessionslot = async (req, res) => {
//   try {
//     const { time, title, capacity, deadlineTime, trainer, category, slotdate } = req.body;
//     console.log("slotdate", slotdate);

//     const slot = await Sessionslot.create({
//       time,
//       title, capacity, deadlineTime, trainer, category, slotdate, tempdate: slotdate, available_seats: capacity,
//       isActive: true,
//       isDelete: false,
//     });
//     return apiResponse.successResponseWithData(res, "Slot added successfully", slot);
//   } catch (error) {
//     console.log("Add slot failed", error);
//     return apiResponse.ErrorResponse(res, "Add slot failed");
//   }
// };

exports.addSessionslot = async (req, res) => {
  try {
    const { time, title, capacity, deadlineTime, trainer, category, slotdate, slotType, tempdate } = req.body;


    // Check if the trainer is already assigned to another slot during the same time range
    const trainerConflict = await Sessionslot.findOne({
      where: {
        isDelete: false,
        slotdate, // Ensure it's the same date
        trainer, // Ensure it's the same trainer
        [Op.or]: [
          {
            time: {
              [Op.between]: [time, deadlineTime], // Check if time overlaps
            },
          },
          {
            deadlineTime: {
              [Op.between]: [time, deadlineTime], // Check if deadline overlaps
            },
          },
          {
            time: {
              [Op.lte]: time, // Check if the slot starts before or at the requested time
              [Op.gte]: deadlineTime, // Check if the slot ends after or at the requested deadlineTime
            },
          },
        ],
      },
    });

    if (trainerConflict && trainer !== "") {
      return apiResponse.ErrorResponse(
        res,
        `The trainer ${trainerConflict.trainer} is already assigned to a slot between ${trainerConflict.time} and ${trainerConflict.deadlineTime}. Please choose another trainer or time.`
      );
    }

    // If the slot type is 'inhouse', validate that no other slots exist during the same time, regardless of category.
    if (slotType === "inhouse") {
      const conflictingInhouseSlot = await Sessionslot.findOne({
        where: {
          isDelete: false,
          slotdate, // Ensure it's the same date
          [Op.or]: [
            {
              time: {
                [Op.between]: [time, deadlineTime], // Check if time overlaps
              },
            },
            {
              deadlineTime: {
                [Op.between]: [time, deadlineTime], // Check if deadline overlaps
              },
            },
            {
              time: {
                [Op.lte]: time, // Check if the slot starts before or at the requested time
                [Op.gte]: deadlineTime, // Check if the slot ends after or at the requested deadlineTime
              },
            },
          ],
        },
      });

      if (conflictingInhouseSlot) {
        return apiResponse.ErrorResponse(
          res,
          `An inhouse slot already exists between ${conflictingInhouseSlot.time} and ${conflictingInhouseSlot.deadlineTime}. Please select another time.`
        );
      }
    }

    // If the slot type is 'onsite', no category check is needed, and multiple slots can coexist at the same time.
    if (slotType === "get-getSessionbySessionslot") {
      console.log("Onsite slot type; skipping category and time conflict check.");
    }

    // Create the new slot
    const slot = await Sessionslot.create({
      time,
      title,
      capacity,
      deadlineTime,
      trainer,
      category,
      slotdate,
      tempdate,
      available_seats: capacity,
      isActive: true,
      isDelete: false,
      slotType, // Store the type of the slot for future reference
    });

    return apiResponse.successResponseWithData(res, "Slot added successfully", slot);
  } catch (error) {
    console.log("Add slot failed", error);
    return apiResponse.ErrorResponse(res, "Add slot failed");
  }
};

// Check for trainer conflict without stopping the creation process
exports.checkTrainerConflictByDate = async (req, res) => {
  try {
    const { trainer, slotdate } = req.body;

    // Check if the trainer is already assigned to another slot on the same day
    const trainerConflict = await Sessionslot.findOne({
      where: {
        isDelete: false,
        slotdate, // Ensure it's the same date
        trainer, // Ensure it's the same trainer
      },
    });

    if (trainerConflict && trainer !== "") {
      return apiResponse.successResponseWithData(res, "Trainer conflict", {
        conflict: true,
        trainer: trainerConflict.trainer,
        existingSlot: `The trainer is already assigned on ${slotdate}.`,
      });
    }

    return apiResponse.successResponseWithData(res, "No conflict", { conflict: false });
  } catch (error) {
    console.log("Conflict check failed", error);
    return apiResponse.ErrorResponse(res, "Conflict check failed");
  }
};



exports.updateSessionslot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      slotdate,
      time,
      deadlineTime,
      trainer,
      category,
      capacity,
      title,
      slotType, tempdate
    } = req.body;

    const slot = await Sessionslot.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    // Check if the trainer is already assigned to another slot during the same time range
    const trainerConflict = await Sessionslot.findOne({
      where: {
        isDelete: false,
        slotdate, // Ensure it's the same date
        trainer, // Ensure it's the same trainer
        id: { [Op.ne]: id }, // Exclude the current slot being updated
        [Op.or]: [
          {
            time: {
              [Op.between]: [time, deadlineTime], // Check if time overlaps
            },
          },
          {
            deadlineTime: {
              [Op.between]: [time, deadlineTime], // Check if deadline overlaps
            },
          },
          {
            time: {
              [Op.lte]: time, // Check if the slot starts before or at the requested time
              [Op.gte]: deadlineTime, // Check if the slot ends after or at the requested deadlineTime
            },
          },
        ],
      },
    });

    if (trainerConflict && trainer !== "") {
      return apiResponse.ErrorResponse(
        res,
        `The trainer ${trainerConflict.trainer} is already assigned to a slot between ${trainerConflict.time} and ${trainerConflict.deadlineTime}. Please choose another trainer or time.`
      );
    }

    // If the slot type is 'inhouse', validate that no other slots exist during the same time, regardless of category.
    if (slotType === "inhouse") {
      const conflictingInhouseSlot = await Sessionslot.findOne({
        where: {

          isDelete: false,
          slotType: "inhouse",
          slotdate, // Ensure it's the same date
          id: { [Op.ne]: id }, // Exclude the current slot being updated
          [Op.or]: [
            {
              time: {
                [Op.between]: [time, deadlineTime], // Check if time overlaps
              },
            },
            {
              deadlineTime: {
                [Op.between]: [time, deadlineTime], // Check if deadline overlaps
              },
            },
            {
              time: {
                [Op.lte]: time, // Check if the slot starts before or at the requested time
                [Op.gte]: deadlineTime, // Check if the slot ends after or at the requested deadlineTime
              },
            },
          ],
        },
      });

      if (conflictingInhouseSlot) {
        return apiResponse.ErrorResponse(
          res,
          `An inhouse slot already exists between ${conflictingInhouseSlot.time} and ${conflictingInhouseSlot.deadlineTime}. Please select another time.`
        );
      }
    }

    // If the slot type is 'onsite', no category check is needed, and multiple slots can coexist at the same time.
    if (slotType === "onsite") {
      console.log("Onsite slot type; skipping category and time conflict check.");
    }

    if (capacity !== slot.capacity) {
      const capacityDifference = capacity - slot.capacity;

      if (capacityDifference > 0) {
        // Capacity increased: Add the difference to available_seats
        slot.available_seats += capacityDifference;
      } else {
        // Capacity decreased: Adjust available_seats but ensure it's not negative
        slot.available_seats = Math.max(0, slot.available_seats + capacityDifference);

        // Ensure available_seats does not exceed the new capacity
        slot.available_seats = Math.min(slot.available_seats, capacity);
      }
    }

    slot.slotdate = slotdate;
    slot.time = time;
    slot.deadlineTime = deadlineTime;
    slot.category = category;
    slot.trainer = trainer;
    slot.capacity = capacity; // Update capacity
    slot.title = title;
    slot.slotType = slotType;
    slot.tempdate = tempdate;

    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot updated successfully", slot);
  } catch (error) {
    console.log("Update slot failed", error);
    return apiResponse.ErrorResponse(res, "Update slot failed");
  }
};

// Get All Sessionslot
exports.getSessionSessionslot = async (req, res) => {
  try {

    const sessionslot = await Sessionslot.findAll({ where: { isDelete: false } });
    return apiResponse.successResponseWithData(res, "Sessionslot retrieved successfully", sessionslot);
  } catch (error) {
    console.log("Get Sessionslot failed", error);
    return apiResponse.ErrorResponse(res, "Get Sessionslot failed");
  }
};
exports.getSessionbySessionslot = async (req, res) => {
  try {
    const { slotdate, category, slotType } = req.body;
    const slotTypeFilter = slotType ? { slotType: slotType } : {}; // Use lowercase 'slotType'

    // Fetch sessions with related SlotRegisterInfo
    const sessionslot = await Sessionslot.findAll({
      where: {
        slotdate,
        category,
        isDelete: false,
        ...slotTypeFilter, // Apply optional filter for slotType
      },
      include: [
        {
          model: SlotRegisterInfo,
          as: 'slotRegisterInfos', // Ensure this alias matches the association
          attributes: [
            'id',
            'slotdate',
            'slotsession',
            'institution_name',
            'institution_email',
            'institution_phone',
            'coordinator_mobile',
            'coordinator_name',
            'hm_principal_manager_mobile',
            'hm_principal_manager_name',
          ], // Fetch only required fields
        },
      ],
    });

    // Check if any sessions were found
    // if (sessionslot.length === 0) {
    //   return apiResponse.ErrorResponse(res, 'No sessions found matching the criteria');
    // }

    return apiResponse.successResponseWithData(res, 'Sessionslot retrieved successfully', sessionslot);
  } catch (error) {
    console.log('Get Sessionslot failed', error);
    return apiResponse.ErrorResponse(res, `Get Sessionslot failed: ${error.message}`);
  }
};


exports.getSessionbySessionslot2 = async (req, res) => {
  try {
    const Slotdate = req.body.slotdate

    const SlotType = req.body.slotType
    const slotTypeFilter = SlotType ? { SlotType } : {}; // If no slotType provided, don't filter by it

    const sessionslot = await Sessionslot.findAll({ where: { slotdate: Slotdate, isDelete: false, ...slotTypeFilter, } });

    return apiResponse.successResponseWithData(res, "Sessionslot retrieved successfully", sessionslot);
  } catch (error) {
    console.log("Get Sessionslot failed", error);
    return apiResponse.ErrorResponse(res, "Get Sessionslot failed");
  }
};
// Toggle isActive status
exports.toggleIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    slot.isActive = !slot.isActive;
    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot active status updated", slot);
  } catch (error) {
    console.log("Toggle slot active status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle slot active status failed");
  }
};

// Toggle isDelete status (Soft delete)
// Toggle isDelete status (Soft delete)
const BookingForm = require("../models/BookingForm");


exports.toggleIsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

    // Check if slot exists and is not already deleted
    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found or already deleted");
    }

    // Check for existing bookings associated with this slot
    const associatedBookings = await BookingForm.findOne({
      where: { sessionSlotId: id, isDelete: false }, // Assuming only active bookings matter
    });

    if (associatedBookings) {
      return apiResponse.ErrorResponse(
        res,
        "Cannot delete slot because bookings are associated with it."
      );
    }

    // Toggle the isDelete status
    slot.isDelete = !slot.isDelete;
    await slot.save();

    return apiResponse.successResponseWithData(
      res,
      "Slot delete status updated successfully",
      slot
    );
  } catch (error) {
    console.error("Toggle slot delete status failed", error);
    return apiResponse.ErrorResponse(res, "Toggle slot delete status failed");
  }
};


// Get Sessionslots by Category
exports.getSessionslotsByCategory = async (req, res) => {
  try {
    const { category, slotdate } = req.body;  // Assuming both parameters are in the URL path

    // Retrieve sessionslot based on category and slotdate
    const sessionslots = await Sessionslot.findAll({
      where: {
        category,
        slotdate,  // Filter by slotdate as well
        isDelete: false,  // Only non-deleted slots
      },
    });

    if (!sessionslots || sessionslots.length === 0) {
      return apiResponse.notFoundResponse(res, "No session slots found for this category and slotdate");
    }

    return apiResponse.successResponseWithData(res, "Sessionslots retrieved successfully by category and slotdate", sessionslots);
  } catch (error) {
    console.log("Get Sessionslots by category and slotdate failed", error);
    return apiResponse.ErrorResponse(res, "Get Sessionslots by category and slotdate failed");
  }
};
// Update API to accept month and year parameters

exports.getAvailableslots = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10);
    const month = parseInt(req.body.month, 10);
    const { category, slotType } = req.body;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const slotTypeFilter = slotType ? { slotType } : {};

    const sessionslots = await Sessionslot.findAll({
      where: {
        category,
        ...slotTypeFilter,
        isDelete: false,
        slotdate: {
          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
          ],
        },
      },
    });

    const holidays = await Holiday.findAll({
      where: {
        holiday_date: {
          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
          ],
        },
      },
    });

    const holidayDates = holidays.map((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      return `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(2, '0')}`;
    });

    const daysInMonth = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
    let totalMonthlyCapacity = 0;
    let totalMonthlyAvailableSeats = 0;

    const data = daysInMonth.map((day) => {
      const currentDate = new Date(year, month - 1, day);
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      const isHoliday = holidayDates.includes(formattedDate);

      const slotsForDay = sessionslots.filter((slot) => {
        const tempdate = new Date(slot.tempdate);
        const normalizedTempDate = tempdate.toLocaleDateString('en-CA');

        const slotdateParts = slot.slotdate.split('/');
        const normalizedSlotDate = `${slotdateParts[2]}-${slotdateParts[0].padStart(2, '0')}-${slotdateParts[1].padStart(2, '0')}`;

        const formattedRequestedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return normalizedTempDate === formattedRequestedDate || normalizedSlotDate === formattedRequestedDate;
      });

      const totalCapacity = slotsForDay.reduce((total, slot) => total + parseInt(slot.capacity, 10), 0);
      const totalAvailableSeats = slotsForDay.reduce((total, slot) => total + parseInt(slot.available_seats, 10), 0);
      const totalSlots = slotsForDay.length;

      totalMonthlyCapacity += totalCapacity;
      totalMonthlyAvailableSeats += totalAvailableSeats;

      const slotsDetails = slotsForDay.map((slot) => ({
        time: slot.time,
        deadlineTime: slot.deadlineTime,
        availableSeats: slot.available_seats,
      }));

      let status = "available";
      if (isHoliday) {
        status = "Holiday";
      } else if (totalAvailableSeats <= 0) {
        status = "closed";
      }

      return {
        day,
        status,
        totalCapacity,
        totalAvailableSeats,
        totalSlots,
        slots: slotsDetails,
      };
    });

    res.status(200).json({
      message: "Monthly session slots retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Failed to get session slots for month", error);
    res.status(500).json({ error: "Failed to get session slots for month" });
  }
};


exports.getAvailableslots2 = async (req, res) => {
  try {
    const year = parseInt(req.body.year, 10);
    const month = parseInt(req.body.month, 10);
    const { slotType } = req.body;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const slotTypeFilter = slotType ? { slotType } : {};

    const sessionslots = await Sessionslot.findAll({
      where: {
        ...slotTypeFilter,
        isDelete: false,
        slotdate: {
          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
          ],
        },
      },
    });

    const holidays = await Holiday.findAll({
      where: {
        holiday_date: {
          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
          ],
        },
      },
    });

    const holidayDates = holidays.map((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      return `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(2, '0')}`;
    });

    const daysInMonth = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
    let totalMonthlyCapacity = 0;
    let totalMonthlyAvailableSeats = 0;

    const data = daysInMonth.map((day) => {
      const currentDate = new Date(year, month - 1, day);
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      const isHoliday = holidayDates.includes(formattedDate);

      const slotsForDay = sessionslots.filter((slot) => {
        const tempdate = new Date(slot.tempdate);
        const normalizedTempDate = tempdate.toLocaleDateString('en-CA');
        const slotdateParts = slot.slotdate.split('/');
        const normalizedSlotDate = `${slotdateParts[2]}-${slotdateParts[0].padStart(2, '0')}-${slotdateParts[1].padStart(2, '0')}`;
        const formattedRequestedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return normalizedTempDate === formattedRequestedDate || normalizedSlotDate === formattedRequestedDate;
      });

      const totalCapacity = slotsForDay.reduce((total, slot) => total + parseInt(slot.capacity, 10), 0);
      const totalAvailableSeats = slotsForDay.reduce((total, slot) => total + parseInt(slot.available_seats, 10), 0);
      const totalSlots = slotsForDay.length;

      totalMonthlyCapacity += totalCapacity;
      totalMonthlyAvailableSeats += totalAvailableSeats;

      let status = "available";
      if (isHoliday) {
        status = "Holiday";
      } else if (totalAvailableSeats <= 0) {
        status = "closed";
      }

      return {
        slotsForDay,
        day,
        status,
        totalCapacity,
        totalAvailableSeats,
        totalSlots,
      };
    });

    res.status(200).json({
      message: "Monthly session slots retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Failed to get session slots for month", error);
    res.status(500).json({ error: "Failed to get session slots for month" });
  }
};





// Update API to accept month and year parameters
// exports.getAvailableslots = async (req, res) => {
//   try {
//     const { category, year, month } = req.body;

//     // Fetch all session slots for the given month and year
//     const sessionslots = await Sessionslot.findAll({
//       where: {
//         category,
//         isDelete: false,
//         slotdate: {
//           [Op.and]: [
//             sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
//             sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
//           ],
//         },
//       },
//     });

//     // Fetch all holidays for the given month and year
//     const holidays = await Holiday.findAll({
//       where: {
//         holiday_date: {
//           [Op.and]: [
//             sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
//             sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
//           ],
//         },
//       },
//     });

//     // Extract holiday dates as full dates (not just day of the month)
//     const holidayDates = holidays.map((holiday) => {
//       const holidayDate = new Date(holiday.holiday_date);
//       return `${holidayDate.getFullYear()}-${holidayDate.getMonth() + 1}-${holidayDate.getDate()}`;
//     });

//     // Create a map to hold all days in the month (1 to 31)
//     const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

//     // Process each slot and determine its status (available or closed)
//     const data = daysInMonth.map((day) => {
//       const currentDate = new Date(year, month - 1, day);  // Create current date for comparison (month is 0-indexed)
//       const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

//       // Check if the day is a holiday
//       const isHoliday = holidayDates.includes(formattedDate);

//       // Check if a session exists for the given day
//       const slotForDay = sessionslots.find((slot) => {
//         const slotDate = new Date(slot.tempdate);
//         return slotDate.getFullYear() === year && slotDate.getMonth() + 1 === month && slotDate.getDate() === day;
//       });

//       if (isHoliday) {
//         // If it's a holiday, set status to "Holiday"
//         return {
//           day,
//           status: "Holiday",
//         };
//       }

//       // If a session exists for the day, determine availability based on capacity
//       if (slotForDay) {
//         return {
//           day,
//           status: parseInt(slotForDay.capacity) > 0 ? "available" : "closed", // If capacity > 0, status is available
//         };
//       } else {
//         // If no slot exists for this day, consider it closed
//         return {
//           day,
//           status: "closed", // No session means closed by default
//         };
//       }
//     });

//     res.status(200).json({
//       message: "Monthly session slots retrieved successfully",
//       data,
//     });
//   } catch (error) {
//     console.log("Failed to get session slots for month", error);
//     res.status(500).json({ error: "Failed to get session slots for month" });
//   }
// };







// Controller to get available slots by tempdate and category
const moment = require('moment'); // Use moment.js for date parsing and validation

exports.getAvailableSlotsByDateAndCategory = async (req, res) => {
  const { tempdate, category } = req.body; // Assuming tempdate and category are passed in the body

  // Validate 'tempdate' and 'category'
  if (!tempdate || !category) {
    return res.status(400).json({
      message: "Both 'tempdate' and 'category' are required in the request body.",
    });
  }

  // Validate the date format using moment.js
  if (!moment(tempdate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({
      message: "'tempdate' should be in 'YYYY-MM-DD' format.",
    });
  }

  try {
    // Ensure tempdate is in 'YYYY-MM-DD' format
    const formattedDate = moment(tempdate).format('YYYY-MM-DD');

    // Fetch available slots based on tempdate and category
    const availableSlots = await Sessionslot.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('tempdate')), '=', formattedDate),
          { category },
          { isActive: true },
          { isDelete: false }
        ]
      }
    });


    // If no slots are found, return a 404 status with a message
    if (availableSlots.length === 0) {
      return res.status(404).json({
        message: "No available slots found for the given date and category.",
      });
    }

    // Return the available slots in the response
    return res.status(200).json({
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return res.status(500).json({
      message: "An error occurred while fetching available slots.",
      error: error.message,
    });
  }
};


// Adjust path as needed

exports.fetchSlots = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of the day

    // Fetch sessionslots and related SlotRegisterInfo
    const slots = await Sessionslot.findAll({
      where: {
        tempdate: {
          [Op.gte]: today, // Fetch slots from today onwards
        },
        isActive: true, // Optional: Only fetch active slots
        isDelete: false, // Optional: Exclude deleted slots
      },
      include: [
        {
          model: SlotRegisterInfo,
          as: "slotRegisterInfos",
          required: false, // Include slots even if they have no related SlotRegisterInfo
        },
      ],
    });

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


