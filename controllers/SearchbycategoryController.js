const BookingForm = require("../models/BookingForm");
const Sessionslot = require("../models/sesssionslot"); // Import the BookingForm and Sessionslot models

// Search function to filter BookingForm by category
exports.searchBookingFormByCategory = async (req, res) => {
    try {
        const { categories } = req.query;

        // Check if categories are provided
        if (!categories) {
            return res.status(400).json({ error: 'Categories are required' });
        }

        // Split the comma-separated categories into an array
        const categoryList = categories.split(',').map(category => category.trim());

        // Query the BookingForm model based on categories and filter out deleted records
        const results = await BookingForm.findAll({
            where: {
                category: categoryList,  // Filter by multiple categories using an array
                isDelete: false           // Ensure the record is not marked as deleted
            },
            include: [{
                model: Sessionslot,
                as: 'Sessionslot', // Assuming the relationship is set up correctly
            }],
        });

        // If no results are found, return a 404 error
        if (results.length === 0) {
            return res.status(404).json({ message: 'No bookings found for these categories' });
        }

        // Return the found results
        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching BookingForm:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

