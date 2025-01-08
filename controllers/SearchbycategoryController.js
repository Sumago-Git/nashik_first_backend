const BookingForm = require("../models/BookingForm");
const Sessionslot = require("../models/sesssionslot"); // Import the BookingForm and Sessionslot models
const moment = require("moment");// To work with dates easily
const { Op } = require('sequelize');
const sequelize = require('../config/database');

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

// exports.searchBookingFormByCategory = async (req, res) => {

//     try {
//         const { year, categories } = req.query;

//         // Validate required query parameters
//         if (!categories) {
//             return res.status(400).json({ error: 'Categories are required' });
//         }

//         // Fetch years from database if not provided
//         let years = [];
//         if (year) {
//             years = [parseInt(year)];
//         } else {
//             const bookingYears = await BookingForm.findAll({
//                 attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
//                 group: ['year'],
//                 raw: true,
//             });
//             const sessionYears = await Sessionslot.findAll({
//                 attributes: [[Sequelize.fn('YEAR', Sequelize.col('tempdate')), 'year']],
//                 group: ['year'],
//                 raw: true,
//             });

//             years = [...new Set([...bookingYears.map(y => y.year), ...sessionYears.map(y => y.year)])];
//         }

//         const months = [
//             'January', 'February', 'March', 'April', 'May', 'June',
//             'July', 'August', 'September', 'October', 'November', 'December'
//         ];

//         let result = { years: [] };

//         // Iterate over years
//         for (const year of years) {
//             let yearData = { year, months: [] };

//             // Iterate over months
//             for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
//                 const monthName = months[monthIndex];
//                 const startOfMonth = moment(`${year}-${monthIndex + 1}`, 'YYYY-MM').startOf('month');
//                 const endOfMonth = startOfMonth.clone().endOf('month');

//                 const weeks = [];

//                 // Divide month into weeks
//                 for (let week = 0; week < 4; week++) {
//                     const startOfWeek = startOfMonth.clone().add(week * 7, 'days').startOf('week');
//                     const endOfWeek = startOfWeek.clone().endOf('week');

//                     // Break the loop if the week exceeds the month's end
//                     if (startOfWeek.isAfter(endOfMonth)) break;

//                     // Get counts for Sessionslot
//                     const { count: totalSlotCount } = await Sessionslot.findAndCountAll({
//                         where: {
//                             category: { [Op.in]: categories.split(',') },
//                             tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
//                             isDelete: false,
//                         },
//                     });

//                     // Get counts for BookingForm
//                     const { count: totalBookingFormCount } = await BookingForm.findAndCountAll({
//                         where: {
//                             category: { [Op.in]: categories.split(',') },
//                             tempdate: { [Op.between]: [startOfWeek.toDate(), endOfWeek.toDate()] },
//                             isDelete: false,
//                         },
//                     });

//                     // Push the week's data
//                     weeks.push({
//                         week: `Week ${week + 1}`,
//                         totalSlotCount,
//                         totalBookingFormCount,
//                     });
//                 }

//                 // Push the month's data
//                 yearData.months.push({ month: monthName, weeks });
//             }

//             // Add year data to result
//             result.years.push(yearData);
//         }

//         // Respond with the final result
//         res.status(200).json(result);
//     } catch (error) {
//         console.error('Error generating report:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };



exports.searchBookingFormByCategory = async (req, res) => {
    try {
        const { year, categories, page = 1, limit = 100 } = req.query;

        // Validate required query parameters
        if (!categories) {
            return res.status(400).json({ error: 'Categories are required' });
        }

        const offset = (page - 1) * limit;
        const currentYear = new Date().getFullYear();
        const selectedYears = year ? [parseInt(year, 10)] : Array.from({ length: currentYear - 2017 + 1 }, (_, i) => 2017 + i);

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        let result = { years: [] };

        for (const year of selectedYears) {
            let yearData = { year, months: [] };

            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthName = months[monthIndex];
                const startOfMonth = moment(`${year}-${monthIndex + 1}`, 'YYYY-MM').startOf('month');
                const endOfMonth = startOfMonth.clone().endOf('month');

                // Aggregate data at the database level for the entire month
                const [totalSlotCounts, totalBookingCounts] = await Promise.all([
                    Sessionslot.findAll({
                        attributes: [
                            [sequelize.fn('WEEK', sequelize.col('tempdate')), 'week'],
                            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                        ],
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()] },
                            isDelete: false,
                        },
                        group: 'week',
                    }),
                    BookingForm.findAll({
                        attributes: [
                            [sequelize.fn('WEEK', sequelize.col('tempdate')), 'week'],
                            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                        ],
                        where: {
                            category: { [Op.in]: categories.split(',') },
                            tempdate: { [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()] },
                            isDelete: false,
                        },
                        group: 'week',
                    }),
                ]);

                // Process weeks data in memory
                const weeks = [];
                for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
                    const startOfWeek = startOfMonth.clone().add(weekIndex * 7, 'days').startOf('week');
                    const endOfWeek = startOfWeek.clone().endOf('week');

                    if (startOfWeek.isAfter(endOfMonth)) break;

                    const slotCount = totalSlotCounts.find(w => parseInt(w.dataValues.week, 10) === weekIndex + 1)?.dataValues.count || 0;
                    const bookingCount = totalBookingCounts.find(w => parseInt(w.dataValues.week, 10) === weekIndex + 1)?.dataValues.count || 0;

                    weeks.push({
                        week: `Week ${weekIndex + 1}`,
                        totalSlotCount: slotCount,
                        totalBookingFormCount: bookingCount,
                    });
                }

                yearData.months.push({ month: monthName, weeks });
            }

            result.years.push(yearData);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.searchBookingFormByTrainer = async (req, res) => {

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
