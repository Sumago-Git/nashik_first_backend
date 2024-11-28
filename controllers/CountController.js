const Sequelize = require("sequelize");
const Sessionslot = require("../models/sesssionslot");
const BookingForm = require("../models/BookingForm");

exports.getCounts = async (req, res) => {
  try {
    // Count total number of session slots
    const sessionSlotCount = await Sessionslot.count();

    // Count total number of booking entries by category where isDelete is false
    const bookingEntryCountByCategory = await BookingForm.findAll({
      attributes: [
        'category',  // Field to group by
        [Sequelize.fn('COUNT', Sequelize.col('category')), 'count']  // Count number of entries for each category
      ],
      group: ['category'],  // Group by category
      where: {
        isDelete: false,  // Only count bookings where isDelete is false
      },
      raw: true  // This will give you plain objects instead of Sequelize instances
    });

    // Calculate the total count by summing all the category counts
    const totalBookingCount = bookingEntryCountByCategory.reduce((total, category) => {
      return total + category.count;
    }, 0);

    // Send the counts as response
    return res.status(200).json({
      success: true,
      message: "Counts retrieved successfully",
      data: {
        sessionSlotCount,
        bookingEntryCountByCategory,
        totalBookingCount,  // Total count of all bookings
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching counts",
      error: error.message,
    });
  }
};
