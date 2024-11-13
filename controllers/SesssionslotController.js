const Sessionslot = require("../models/sesssionslot");
const apiResponse = require("../helper/apiResponse");
const sequelize = require('../config/database'); // Make sure to import sequelize from your DB config file
const Holiday = require("../models/Holiday");
const { Op } = require('sequelize');
// Add Slot

exports.addSessionslot = async (req, res) => {
  try {
    const { time, title, capacity, deadlineTime, trainer, category, slotdate, tempdate } = req.body;
    console.log("slotdate", slotdate);

    const slot = await Sessionslot.create({
      time,
      title, capacity, deadlineTime, trainer, category, slotdate, tempdate: slotdate, available_seats: capacity,
      isActive: true,
      isDelete: false,
    });
    return apiResponse.successResponseWithData(res, "Slot added successfully", slot);
  } catch (error) {
    console.log("Add slot failed", error);
    return apiResponse.ErrorResponse(res, "Add slot failed");
  }
};

exports.updateSessionslot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }
    slot.slotdate = req.body.slotdate;
    slot.time = req.body.time;
    slot.category = req.body.category;
    slot.trainer = req.body.trainer;
    slot.deadlineTime = req.body.deadlineTime;
    slot.capacity = req.body.capacity;
    slot.title = req.body.title,

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
    const Slotdate = req.body.slotdate
    const Category = req.body.category
    const sessionslot = await Sessionslot.findAll({ where: { slotdate: Slotdate, category: Category } });

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
exports.toggleIsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Sessionslot.findByPk(id);

    if (!slot || slot.isDelete) {
      return apiResponse.notFoundResponse(res, "Slot not found");
    }

    slot.isDelete = !slot.isDelete;
    await slot.save();

    return apiResponse.successResponseWithData(res, "Slot delete status updated", slot);
  } catch (error) {
    console.log("Toggle slot delete status failed", error);
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
    const { category, year, month } = req.body;

    // Fetch all session slots for the given month and year
    const sessionslots = await Sessionslot.findAll({
      where: {
        category,
        isDelete: false,
        slotdate: {
          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('tempdate')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('tempdate')), month),
          ],
        },
      },
    });

    // Fetch all holidays for the given month and year
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

    // Extract holiday dates as full dates (not just day of the month)
    const holidayDates = holidays.map((holiday) => {
      const holidayDate = new Date(holiday.holiday_date);
      return `${holidayDate.getFullYear()}-${holidayDate.getMonth() + 1}-${holidayDate.getDate()}`;
    });

    // Create a map to hold all days in the month (1 to 31)
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    // Process each slot and determine its status (available or closed)
    const data = daysInMonth.map((day) => {
      const currentDate = new Date(year, month - 1, day);  // Create current date for comparison (month is 0-indexed)
      const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

      // Check if the day is a holiday
      const isHoliday = holidayDates.includes(formattedDate);

      // Filter session slots for the given day
      const slotsForDay = sessionslots.filter((slot) => {
        // Parse the tempdate as UTC and format as local date in YYYY-MM-DD
        const tempdate = new Date(slot.tempdate);
        const normalizedTempDate = tempdate.toLocaleDateString('en-CA'); // outputs YYYY-MM-DD format

        // Convert slot.slotdate (MM/DD/YYYY) into YYYY-MM-DD for comparison
        const slotdateParts = slot.slotdate.split('/');
        const normalizedSlotDate = `${slotdateParts[2]}-${slotdateParts[0].padStart(2, '0')}-${slotdateParts[1].padStart(2, '0')}`;

        // Construct the requested date in YYYY-MM-DD format
        const formattedRequestedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Log dates for debugging
        console.log("Normalized Temp Date:", normalizedTempDate);
        console.log("Normalized Slot Date:", normalizedSlotDate);
        console.log("Formatted Requested Date:", formattedRequestedDate);

        // Compare the dates
        return normalizedTempDate === formattedRequestedDate || normalizedSlotDate === formattedRequestedDate;
      });

      // Calculate total capacity and total available seats for the day
      const totalCapacity = slotsForDay.reduce((total, slot) => total + parseInt(slot.capacity, 10), 0);
      const totalAvailableSeats = slotsForDay.reduce((total, slot) => total + parseInt(slot.available_seats, 10), 0);

      let status = "available"; // Default to "closed"
      if (isHoliday) {
        // If it's a holiday, set status to "Holiday"
        status = "Holiday";

      } else if (totalAvailableSeats == 0) {
        // Mark as closed if no available seats
        status = "closed";
      }

      return {
        day,
        status,
        totalCapacity,
        totalAvailableSeats,
      };
    });

    res.status(200).json({
      message: "Monthly session slots retrieved successfully",
      data,
    });
  } catch (error) {
    console.log("Failed to get session slots for month", error);
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






