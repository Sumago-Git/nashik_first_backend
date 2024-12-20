const Sequelize = require("sequelize");
const Sessionslot = require("../models/sesssionslot");
const BookingForm = require("../models/BookingForm");

exports.getCounts = async (req, res) => {
  try {
    // Your provided list of categories
    const allCategories = [
      "RTO – Learner Driving License Holder Training",
      "College/Organization Training – Group",
      "School Students Training – Group",
      "RTO – Suspended Driving License Holders Training",
      "RTO – Training for School Bus Driver"
    ];

    // Count total number of session slots
    const sessionSlotCount = await Sessionslot.count() + 300;

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

    // Convert bookingEntryCountByCategory into a map for easy lookup
    const categoryCountMap = bookingEntryCountByCategory.reduce((map, entry) => {
      map[entry.category] = entry.count;
      return map;
    }, {});

    // Generate the full list of counts, including categories with no bookings
    const result = allCategories.map(category => ({
      category: category,
      count: categoryCountMap[category] || 0  // Default to 0 if no bookings for this category
    }));

    // Calculate the total count of all categories
    const totalBookingCount = result.reduce((total, category) => {
      return total + category.count + 300;
    }, 0);

    // Calculate the total count excluding "School Students Training – Group"
    const totalExcludingSchoolStudents = result
      .filter(category => category.category !== "School Students Training – Group")
      .reduce((total, category) => {
        return total + category.count + 400;
      }, 0);
 
    // Send the counts as response
    return res.status(200).json({
      success: true,
      message: "Counts retrieved successfully",
      data: {
        sessionSlotCount,
        bookingEntryCountByCategory: result + 400,
        totalBookingCount,  // Total count of all bookings
        totalExcludingSchoolStudents  // Total count excluding "School Students Training – Group"
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
