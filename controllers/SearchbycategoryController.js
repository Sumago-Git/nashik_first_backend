const BookingForm = require("../models/BookingForm");
const Sessionslot = require("../models/sesssionslot"); // Import the BookingForm and Sessionslot models
const moment = require("moment");// To work with dates easily
const { Op } = require('sequelize');
// Search function to filter BookingForm by category
// exports.searchBookingFormByCategory = async (req, res) => {
//     try {
//         const { categories } = req.query;

//         // Check if categories are provided
//         if (!categories) {
//             return res.status(400).json({ error: 'Categories are required' });
//         }

//         // Split the comma-separated categories into an array
//         const categoryList = categories.split(',').map(category => category.trim());

//         // Query the BookingForm model based on categories and filter out deleted records
//         const results = await BookingForm.findAll({
//             where: {
//                 category: categoryList,  // Filter by multiple categories using an array
//                 isDelete: false           // Ensure the record is not marked as deleted
//             },
//             include: [{
//                 model: Sessionslot,
//                 as: 'Sessionslot', // Assuming the relationship is set up correctly
//             }],
//         });

//         // If no results are found, return a 404 error
//         if (results.length === 0) {
//             return res.status(404).json({ message: 'No bookings found for these categories' });
//         }

//         // Return the found results
//         res.status(200).json(results);
//     } catch (error) {
//         console.error('Error searching BookingForm:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
// To use Sequelize operators
const Sequelize = require('../config/database'); // Make sure to import sequelize from your DB config file

exports.searchBookingFormByCategory = async (req, res) => {

    try {
        const { year, categories } = req.query;

        // Validate required query parameters
        if (!categories) {
            return res.status(400).json({ error: 'Categories are required' });
        }

        // Fetch years from database if not provided
        let years = [];
        if (year) {
            years = [parseInt(year)];
        } else {
            const bookingYears = await BookingForm.findAll({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
                group: ['year'],
                raw: true,
            });
            const sessionYears = await Sessionslot.findAll({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
                group: ['year'],
                raw: true,
            });

            years = [...new Set([...bookingYears.map(y => y.year), ...sessionYears.map(y => y.year)])];
        }

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let result = { years: [] };

        // Iterate over years
        for (const year of years) {
            let yearData = { year, months: [] };

            // Iterate over months
            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthName = months[monthIndex];
                const startOfMonth = moment(`${year}-${monthIndex + 1}`, 'YYYY-MM').startOf('month');
                const endOfMonth = startOfMonth.clone().endOf('month');

                const weeks = [];

                // Divide month into weeks
                for (let week = 0; week < 4; week++) {
                    const startOfWeek = startOfMonth.clone().add(week * 7, 'days').startOf('week');
                    const endOfWeek = startOfWeek.clone().endOf('week');

                    // Break the loop if the week exceeds the month's end
                    if (startOfWeek.isAfter(endOfMonth)) break;

                    // Get counts for Sessionslot
                    const { count: totalSlotCount } = await Sessionslot.findAndCountAll({
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
                            isDelete: false,
                        },
                    });

                    // Get counts for BookingForm
                    const { count: totalBookingFormCount } = await BookingForm.findAndCountAll({
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
                            isDelete: false,
                        },
                    });

                    // Push the week's data
                    weeks.push({
                        week: `Week ${week + 1}`,
                        totalSlotCount,
                        totalBookingFormCount,
                    });
                }

                // Push the month's data
                yearData.months.push({ month: monthName, weeks });
            }

            // Add year data to result
            result.years.push(yearData);
        }

        // Respond with the final result
        res.status(200).json(result);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchBookingFormByCategory = async (req, res) => {

    try {
        const { year, categories } = req.query;

        // Validate required query parameters
        if (!categories) {
            return res.status(400).json({ error: 'Categories are required' });
        }

        // Fetch years from database if not provided
        let years = [];
        if (year) {
            years = [parseInt(year)];
        } else {
            const bookingYears = await BookingForm.findAll({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
                group: ['year'],
                raw: true,
            });
            const sessionYears = await Sessionslot.findAll({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
                group: ['year'],
                raw: true,
            });

            years = [...new Set([...bookingYears.map(y => y.year), ...sessionYears.map(y => y.year)])];
        }

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let result = { years: [] };

        // Iterate over years
        for (const year of years) {
            let yearData = { year, months: [] };

            // Iterate over months
            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthName = months[monthIndex];
                const startOfMonth = moment(`${year}-${monthIndex + 1}`, 'YYYY-MM').startOf('month');
                const endOfMonth = startOfMonth.clone().endOf('month');

                const weeks = [];

                // Divide month into weeks
                for (let week = 0; week < 4; week++) {
                    const startOfWeek = startOfMonth.clone().add(week * 7, 'days').startOf('week');
                    const endOfWeek = startOfWeek.clone().endOf('week');

                    // Break the loop if the week exceeds the month's end
                    if (startOfWeek.isAfter(endOfMonth)) break;

                    // Get counts for Sessionslot
                    const { count: totalSlotCount } = await Sessionslot.findAndCountAll({
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
                            isDelete: false,
                        },
                    });

                    // Get counts for BookingForm
                    const { count: totalBookingFormCount } = await BookingForm.findAndCountAll({
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
                            isDelete: false,
                        },
                    });

                    // Push the week's data
                    weeks.push({
                        week: `Week ${week + 1}`,
                        totalSlotCount,
                        totalBookingFormCount,
                    });
                }

                // Push the month's data
                yearData.months.push({ month: monthName, weeks });
            }

            // Add year data to result
            result.years.push(yearData);
        }

        // Respond with the final result
        res.status(200).json(result);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
