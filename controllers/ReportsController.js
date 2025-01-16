const dbObj = require('../config/dbConfig');  // Import the MySQL pool
const ExcelJS = require('exceljs');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path')
/**
 * Controller for fetching training summary
 */
const trainingTypeWiseCount = async (req, res) => {
  try {
    const { category } = req.body; // Optional category parameter

    let query = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT id) AS TotalPeopleAttended  -- Count of distinct people
      FROM bookingforms
      WHERE training_status = 'Attended'
    `;

    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    const [result] = await dbObj.query(query, category ? [category] : []);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the category: ${category || 'all categories'}`,
      });
    }

    // Calculate overall stats
    const overallStats = result.reduce(
      (totals, row) => {
        totals.totalSessions += row.NoOfSessions;
        totals.totalAttendees += row.TotalPeopleAttended;
        return totals;
      },
      { totalSessions: 0, totalAttendees: 0 }
    );

    res.status(200).json({
      status: true,
      message: `Training summary fetched successfully${category ? ` for category '${category}'` : ''}.`,
      overallStats, // Overall stats
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message,
    });
  }
};



const trainingTypeWiseCountByCategory = async (req, res) => {
  try {
    const { category } = req.body; // Optional category parameter

    let query = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT id) AS TotalPeopleAttended  -- Count of distinct people
      FROM bookingforms
      WHERE training_status = 'Attended'
      GROUP BY TrainingType;
    `;

    if (category && (category === 'School' || category === 'Adult')) {
      query = `
        SELECT 
          CASE 
            WHEN category = 'School Students Training – Group' THEN 'School'
            ELSE 'Adult'
          END AS TrainingType,
          COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
          COUNT(DISTINCT id) AS TotalPeopleAttended,  -- Count of distinct people
          category AS CategoryName  -- Include the category name
        FROM bookingforms
        WHERE training_status = 'Attended' AND 
          CASE 
            WHEN category = 'School Students Training – Group' THEN 'School'
            ELSE 'Adult'
          END = ? 
        GROUP BY TrainingType, category;
      `;
    }

    const [result] = await dbObj.query(query, category ? [category] : []);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the category: ${category}`,
      });
    }

    res.status(200).json({
      status: true,
      message: `Training summary for category '${category}' fetched successfully.`,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data by category.',
      error: error.message
    });
  }
};


const trainingTypeWiseCountByYear = async (req, res) => {
  try {
    const { year, category } = req.body; // Required: year, optional: category

    if (!year) {
      return res.status(400).json({
        status: false,
        message: 'Year parameter is required.',
      });
    }

    // Query to fetch data grouped by TrainingType and overall totals
    let query = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT id) AS TotalPeopleAttended  -- Count of distinct people
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
    `;

    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    // Query to fetch overall totals
    const overallQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
    `;

    if (category && ['School', 'Adult'].includes(category)) {
      overallQuery += ` AND CASE 
                          WHEN category = 'School Students Training – Group' THEN 'School'
                          ELSE 'Adult'
                        END = ?`;
    }

    // Execute both queries
    const [result] = await dbObj.query(query, category ? [year, category] : [year]);
    const [overallResult] = await dbObj.query(overallQuery, category ? [year, category] : [year]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the year: ${year}${category ? ' and category: ' + category : ''}`,
      });
    }

    const overall = overallResult[0] || { TotalSessions: 0, TotalAttendees: 0 };

    res.status(200).json({
      status: true,
      message: `Training summary for the year '${year}'${category ? ' and category: ' + category : ''} fetched successfully.`,
      data: {
        trainingTypeWise: result,
        overallCount: {
          totalSessions: overall.TotalSessions,
          totalAttendees: overall.TotalAttendees,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data for the year.',
      error: error.message,
    });
  }
};


const trainingTypeWiseCountByMonth = async (req, res) => {
  try {
    const { year, month, category } = req.body; // Required: year, month, optional: category

    if (!year || !month) {
      return res.status(400).json({
        status: false,
        message: 'Both year and month parameters are required.',
      });
    }

    // Query to fetch data grouped by TrainingType
    let query = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT id) AS TotalPeopleAttended  -- Count of distinct people
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ? AND MONTH(createdAt) = ?
    `;

    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    // Query to fetch overall totals for the month
    var overallQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ? AND MONTH(createdAt) = ?
    `;

    if (category && ['School', 'Adult'].includes(category)) {
      overallQuery += ` AND CASE 
                          WHEN category = 'School Students Training – Group' THEN 'School'
                          ELSE 'Adult'
                        END = ?`;
    }

    // Execute both queries
    const [result] = await dbObj.query(query, category ? [year, month, category] : [year, month]);
    const [overallResult] = await dbObj.query(overallQuery, category ? [year, month, category] : [year, month]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the year: ${year}, month: ${month}${category ? ' and category: ' + category : ''}`,
      });
    }

    const overall = overallResult[0] || { TotalSessions: 0, TotalAttendees: 0 };

    res.status(200).json({
      status: true,
      message: `Training summary for the year '${year}' and month '${month}'${category ? ' and category: ' + category : ''} fetched successfully.`,
      data: {
        trainingTypeWise: result,
        overallCount: {
          totalSessions: overall.TotalSessions,
          totalAttendees: overall.TotalAttendees,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data for the month.',
      error: error.message,
    });
  }
};




const trainingTypeWiseCountByYearAllYear = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const yearlyStatsQuery = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
      GROUP BY TrainingType;
    `;

    const monthlyStatsQuery = `
      SELECT 
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
      GROUP BY MonthNumber, TrainingType;
    `;

    const response = [];

    for (let year = startYear; year <= currentYear; year++) {
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [year]);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [year]);

      if (yearlyStats.length > 0) {
        response.push({
          [year]: {
            stats: yearlyStats,
            months: monthlyStats.map(item => ({
              ...item,
              MonthName: monthNames[item.MonthNumber - 1],
            }))
          }
        });
      }
    }

    if (response.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found from 2007 till the current year.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully from 2007 till the current year.',
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message
    });
  }
};
const trainingTypeWiseCountByYearAllx = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const yearlyStatsQuery = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
      GROUP BY TrainingType;
    `;

    const monthlyStatsQuery = `
      SELECT 
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
      GROUP BY MonthNumber, TrainingType;
    `;

    const weeklyStatsQuery = `
      SELECT 
        WEEK(createdAt) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
      GROUP BY WeekNumber, MonthNumber, TrainingType;
    `;

    const response = [];

    for (let year = startYear; year <= currentYear; year++) {
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [year]);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [year]);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, [year]);

      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
            .map(week => ({
              WeekNumber: week.WeekNumber,
              NoOfSessions: week.NoOfSessions,
              TotalPeopleAttended: week.TotalPeopleAttended,
            }));

          return {
            ...month,
            MonthName: monthNames[month.MonthNumber - 1],
            weeks
          };
        });

        response.push({
          [year]: {
            stats: yearlyStats,
            months: monthsWithWeeks
          }
        });
      }
    }

    if (response.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found from 2007 till the current year.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully from 2007 till the current year.',
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message
    });
  }
};

// const trainingTypeWiseCountByYearAll = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const startYear = 2007;

//     const monthNames = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];

//     const { trainingType, year, month, week,download } = req.body; // Optional filters

//     // Base conditions for filters
//     const filters = [];
//     const params = [];

//     // Handle trainingType filter
//     if (trainingType) {
//       filters.push(`
//         CASE 
//           WHEN category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END = ?
//       `);
//       params.push(trainingType);
//     }

//     // Handle other filters (year, month, week)
//     if (year) {
//       filters.push("YEAR(createdAt) = ?");
//       params.push(year);
//     }

//     if (month) {
//       filters.push("MONTH(createdAt) = ?");
//       params.push(month);
//     }

//     if (week) {
//       filters.push("WEEK(createdAt, 1) = ?");
//       params.push(week);
//     }

//     // Combine all filters
//     const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

//     // Queries with dynamic filters
//     const yearlyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         CASE 
//           WHEN category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END AS TrainingType,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, TrainingType
//       HAVING Year = ?;
//     `;

//     const monthlyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         MONTH(createdAt) AS MonthNumber,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended,
//         CASE 
//           WHEN category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END AS TrainingType
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, MonthNumber, TrainingType
//       HAVING Year = ?;
//     `;

//     const weeklyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         WEEK(createdAt, 1) AS WeekNumber,
//         MONTH(createdAt) AS MonthNumber,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended,
//         CASE 
//           WHEN category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END AS TrainingType
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, WeekNumber, MonthNumber, TrainingType
//       HAVING Year = ?;
//     `;

//     const response = [];

//     // Determine which years to process
//     const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

//     for (const processingYear of yearsToProcess) {
//       const yearParams = year ? params : [processingYear, ...params];

//       // Fetch data for the current year
//       const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [...yearParams, processingYear]);
//       const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [...yearParams, processingYear]);
//       const [weeklyStats] = await dbObj.query(weeklyStatsQuery, [...yearParams, processingYear]);

//       // If there's data for the year, process and add to response
//       if (yearlyStats.length > 0) {
//         const monthsWithWeeks = monthlyStats.map(month => {
//           const weeks = weeklyStats
//             .filter(week => week.Year === month.Year && week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
//             .map(week => ({
//               WeekNumber: week.WeekNumber,
//               NoOfSessions: week.NoOfSessions,
//               TotalPeopleAttended: week.TotalPeopleAttended,
//             }))
//             .sort((a, b) => b.WeekNumber - a.WeekNumber); // Sort weeks in descending order

//           return {
//             ...month,
//             MonthName: monthNames[month.MonthNumber - 1],
//             weeks
//           };
//         }).sort((a, b) => b.MonthNumber - a.MonthNumber); // Sort months in descending order

//         response.push({
//           year: processingYear,
//           stats: yearlyStats,
//           months: monthsWithWeeks
//         });
//       }
//     }

//     if (response.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: 'No training summary data found for the provided filters.',
//       });
//     }

//     if (download) {
//       const workbook = xlsx.utils.book_new();
//       const uniqueSheetNames = new Set(); // Track worksheet names

//       response.forEach(trainingSummary => {
//         const statsSheetData = trainingSummary.stats.map(stat => ({
//           Year: stat.Year,
//           TrainingType: stat.TrainingType,
//           NoOfSessions: stat.NoOfSessions,
//           TotalPeopleAttended: stat.TotalPeopleAttended
//         }));
//         const statsSheetName = `${trainingSummary.year} - Stats`;
//         xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(statsSheetData), statsSheetName);
      
//         trainingSummary.months.forEach(month => {
//           const baseName = `${month.MonthName} (${month.TrainingType})`;
//           let sheetName = baseName;
//           let counter = 1;
      
//           // Ensure the sheet name is unique
//           while (uniqueSheetNames.has(sheetName)) {
//             sheetName = `${baseName} (${counter++})`;
//           }
//           uniqueSheetNames.add(sheetName);
      
//           const monthSheetData = month.weeks.map(week => ({
//             Year: month.Year,
//             Month: month.MonthName,
//             WeekNumber: week.WeekNumber,
//             TrainingType: month.TrainingType,
//             NoOfSessions: week.NoOfSessions,
//             TotalPeopleAttended: week.TotalPeopleAttended
//           }));
      
//           const monthSheet = xlsx.utils.json_to_sheet(monthSheetData);
//           xlsx.utils.book_append_sheet(workbook, monthSheet, sheetName);
//         });
//       });

//       const filePath = path.join(__dirname, 'TrainingSummary.xlsx');
//       xlsx.writeFile(workbook, filePath);

//       return res.download(filePath, 'TrainingSummary.xlsx', err => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({
//             status: false,
//             message: 'Failed to generate the Excel file.',
//           });
//         }
//         fs.unlinkSync(filePath); // Clean up the temporary file
//       });
//     }

//     res.status(200).json({
//       status: true,
//       message: 'Training summary data fetched successfully.',
//       data: response
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: 'Failed to fetch training summary data.',
//       error: error.message
//     });
//   }
// };

const trainingTypeWiseCountByYearAll = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { trainingType, year, month, week, download } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    // Handle trainingType filter
    if (trainingType) {
      filters.push(`
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = ?
      `);
      params.push(trainingType);
    }

    // Handle other filters (year, month, week)
    if (year) {
      filters.push("YEAR(createdAt) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(createdAt) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(createdAt, 1) = ?");
      params.push(week);
    }

    // Combine all filters
    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Overall stats query
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition};
    `;

    // Queries with dynamic filters
    const yearlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, TrainingType
      HAVING Year = ?;
    `;

    const monthlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const weeklyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const response = [];

    // Fetch overall stats
    const [overallStats] = await dbObj.query(overallStatsQuery, params);

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [...yearParams, processingYear]);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [...yearParams, processingYear]);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, [...yearParams, processingYear]);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.Year === month.Year && week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
            .map(week => ({
              WeekNumber: week.WeekNumber,
              NoOfSessions: week.NoOfSessions,
              TotalPeopleAttended: week.TotalPeopleAttended,
            }))
            .sort((a, b) => b.WeekNumber - a.WeekNumber); // Sort weeks in descending order

          return {
            ...month,
            MonthName: monthNames[month.MonthNumber - 1],
            weeks
          };
        }).sort((a, b) => b.MonthNumber - a.MonthNumber); // Sort months in descending order

        response.push({
          year: processingYear,
          stats: yearlyStats,
          months: monthsWithWeeks
        });
      }
    }

    if (response.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    const finalResponse = {
      overall: overallStats[0],
      data: response,
    };

    if (download) {
      // Handle Excel file generation here (same as your current implementation)
    }

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully.',
      data: finalResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message,
    });
  }
};


const trainingTypeWiseCountByYearAllAdult = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { trainingType, year, month, week } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    // Handle filters (Only Adult, so no need for "School" logic)
    filters.push(`
      CASE 
        WHEN category = 'School Students Training – Group' THEN 'School'
        ELSE 'Adult'
      END = 'Adult'
    `);

    // Handle other filters (year, month, week)
    if (year) {
      filters.push("YEAR(createdAt) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(createdAt) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(createdAt, 1) = ?");
      params.push(week);
    }

    // Combine all filters
    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Queries for dynamic filters
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition};
    `;

    const yearlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        'Adult' AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, TrainingType
      HAVING Year = ?;
    `;

    const monthlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'Adult' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const weeklyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'Adult' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const response = [];

    // Fetch overall stats
    const [overallStats] = await dbObj.query(overallStatsQuery, params);

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [...yearParams, processingYear]);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [...yearParams, processingYear]);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, [...yearParams, processingYear]);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.Year === month.Year && week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
            .map(week => ({
              WeekNumber: week.WeekNumber,
              NoOfSessions: week.NoOfSessions,
              TotalPeopleAttended: week.TotalPeopleAttended,
            }))
            .sort((a, b) => b.WeekNumber - a.WeekNumber); // Sort weeks in descending order

          return {
            ...month,
            MonthName: monthNames[month.MonthNumber - 1],
            weeks
          };
        }).sort((a, b) => b.MonthNumber - a.MonthNumber); // Sort months in descending order

        response.push({
          year: processingYear,
          stats: yearlyStats,
          months: monthsWithWeeks
        });
      }
    }

    if (response.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully.',
      overallStats: overallStats[0],
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message
    });
  }
};


const trainingTypeWiseCountByYearAllSchool = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { trainingType, year, month, week } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    // Handle trainingType filter (only School)
    filters.push(`
      CASE 
        WHEN category = 'School Students Training – Group' THEN 'School'
        ELSE 'Adult'
      END = 'School'
    `);

    // Handle other filters (year, month, week)
    if (year) {
      filters.push("YEAR(createdAt) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(createdAt) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(createdAt, 1) = ?");
      params.push(week);
    }

    // Combine all filters
    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Queries with dynamic filters for School only
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition};
    `;

    const yearlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        'School' AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, TrainingType
      HAVING Year = ?;
    `;

    const monthlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'School' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const weeklyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'School' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const response = [];

    // Fetch overall stats
    const [overallStats] = await dbObj.query(overallStatsQuery, params);

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [...yearParams, processingYear]);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [...yearParams, processingYear]);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, [...yearParams, processingYear]);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.Year === month.Year && week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
            .map(week => ({
              WeekNumber: week.WeekNumber,
              NoOfSessions: week.NoOfSessions,
              TotalPeopleAttended: week.TotalPeopleAttended,
            }))
            .sort((a, b) => b.WeekNumber - a.WeekNumber); // Sort weeks in descending order

          return {
            ...month,
            MonthName: monthNames[month.MonthNumber - 1],
            weeks
          };
        }).sort((a, b) => b.MonthNumber - a.MonthNumber); // Sort months in descending order

        response.push({
          year: processingYear,
          stats: yearlyStats,
          months: monthsWithWeeks
        });
      }
    }

    if (response.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully.',
      overallStats: overallStats[0],
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message
    });
  }
};




// const trainingTypeWiseCountRTO = async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const startYear = 2007;

//     const monthNames = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];

//     const { year, month, week } = req.body; // Optional filters

//     // Base conditions for filters
//     const filters = [];
//     const params = [];

//     if (year) {
//       filters.push("YEAR(createdAt) = ?");
//       params.push(year);
//     }

//     if (month) {
//       filters.push("MONTH(createdAt) = ?");
//       params.push(month);
//     }

//     if (week) {
//       filters.push("WEEK(createdAt, 1) = ?");
//       params.push(week);
//     }

//     filters.push(`category IN ('RTO – Learner Driving License Holder Training', 'RTO – Suspended Driving License Holders Training', 'RTO – Training for School Bus Driver')`);

//     const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

//     const yearlyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         category AS TrainingCategory,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, category;
//     `;

//     const monthlyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         MONTH(createdAt) AS MonthNumber,
//         category AS TrainingCategory,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, MonthNumber, category;
//     `;

//     const weeklyStatsQuery = `
//       SELECT 
//         YEAR(createdAt) AS Year,
//         WEEK(createdAt, 1) AS WeekNumber,
//         MONTH(createdAt) AS MonthNumber,
//         category AS TrainingCategory,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
//         COUNT(DISTINCT id) AS TotalPeopleAttended
//       FROM bookingforms
//       WHERE training_status = 'Attended' ${filterCondition}
//       GROUP BY Year, WeekNumber, MonthNumber, category;
//     `;

//     const [yearlyStats] = await dbObj.query(yearlyStatsQuery, params);
//     const [monthlyStats] = await dbObj.query(monthlyStatsQuery, params);
//     const [weeklyStats] = await dbObj.query(weeklyStatsQuery, params);

//     if (!yearlyStats.length) {
//       return res.status(404).json({
//         status: false,
//         message: 'No training summary data found for the provided filters.',
//       });
//     }

//     const response = [];
//     const overallStats = { totalSessions: 0, totalAttendees: 0 };

//     const groupedByYear = yearlyStats.reduce((acc, stat) => {
//       const { Year, TrainingCategory, NoOfSessions, TotalPeopleAttended } = stat;

//       if (!acc[Year]) {
//         acc[Year] = { year: Year, stats: [], months: [] };
//       }

//       acc[Year].stats.push({ TrainingCategory, NoOfSessions, TotalPeopleAttended });

//       // Aggregate overall stats
//       overallStats.totalSessions += NoOfSessions;
//       overallStats.totalAttendees += TotalPeopleAttended;

//       return acc;
//     }, {});

//     for (const year in groupedByYear) {
//       const monthsWithWeeks = monthlyStats
//         .filter(month => month.Year == year)
//         .map(month => {
//           const weeks = weeklyStats
//             .filter(week => week.Year == year && week.MonthNumber === month.MonthNumber && week.TrainingCategory === month.TrainingCategory)
//             .map(week => ({
//               WeekNumber: week.WeekNumber,
//               NoOfSessions: week.NoOfSessions,
//               TotalPeopleAttended: week.TotalPeopleAttended,
//             }))
//             .sort((a, b) => b.WeekNumber - a.WeekNumber);

//           return {
//             ...month,
//             MonthName: monthNames[month.MonthNumber - 1],
//             weeks,
//           };
//         })
//         .sort((a, b) => b.MonthNumber - a.MonthNumber);

//       groupedByYear[year].months = monthsWithWeeks;
//       response.push(groupedByYear[year]);
//     }

//     response.sort((a, b) => b.year - a.year); // Sort years in descending order

//     res.status(200).json({
//       status: true,
//       message: 'Training summary data fetched successfully.',
//       overallStats,
//       data: response,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: 'Failed to fetch training summary data.',
//       error: error.message,
//     });
//   }
// };


// const trainingYearWiseCount = async (req, res) => {
//   try {
//     const { year, month, week } = req.body; // Optional filters

//     // Base filters
//     const filters = [];
//     const params = [];

//     // Handle year filter
//     if (year) {
//       filters.push("YEAR(sri.slotdate) = ?");
//       params.push(year);
//     }

//     // Handle month filter
//     if (month) {
//       filters.push("MONTH(sri.slotdate) = ?");
//       params.push(month);
//     }

//     // Handle week filter
//     if (week) {
//       filters.push("WEEK(sri.slotdate, 1) = ?");
//       params.push(week);
//     }

//     // Add filter for specific categories
   

//     // Combine all filters
//     const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

//     // Query to fetch data
//     const query = `
//       SELECT 
//         sri.category,
//         sri.institution_name,
//         sri.slotsession,
//         sri.sessionSlotId,
//         COUNT(DISTINCT bf.id) AS TotalBookings,
//         COUNT(DISTINCT bf.sessionSlotId) AS TotalSessions
//       FROM 
//         slotregisterinfos sri
//       INNER JOIN 
//         bookingforms bf ON sri.sessionSlotId = bf.sessionSlotId
//       WHERE 
//         bf.training_status = 'Attended'
//         ${filterCondition ? `AND ${filterCondition.substring(6)}` : ""}
//       GROUP BY 
//         sri.category, sri.institution_name, sri.slotsession, sri.sessionSlotId
//       ORDER BY 
//         sri.category, sri.institution_name;
//     `;

//     // Execute the query
//     const [results] = await dbObj.query(query, params);

//     if (results.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: "No training data found for the provided filters.",
//       });
//     }

//     // Send the response
//     res.status(200).json({
//       status: true,
//       message: "Training data fetched successfully.",
//       data: results,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: "Failed to fetch training data.",
//       error: error.message,
//     });
//   }
// };
const trainingTypeWiseCountRTO = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { year, month, week } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    if (year) {
      filters.push("YEAR(createdAt) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(createdAt) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(createdAt, 1) = ?");
      params.push(week);
    }

    filters.push(`category IN ('RTO – Learner Driving License Holder Training', 'RTO – Suspended Driving License Holders Training', 'RTO – Training for School Bus Driver')`);

    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    const yearlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        category AS TrainingCategory,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, category;
    `;

    const monthlyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        MONTH(createdAt) AS MonthNumber,
        category AS TrainingCategory,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, category;
    `;

    const weeklyStatsQuery = `
      SELECT 
        YEAR(createdAt) AS Year,
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        category AS TrainingCategory,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, category;
    `;

    const [yearlyStats] = await dbObj.query(yearlyStatsQuery, params);
    const [monthlyStats] = await dbObj.query(monthlyStatsQuery, params);
    const [weeklyStats] = await dbObj.query(weeklyStatsQuery, params);

    if (!yearlyStats.length) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    const response = [];
    const overallStats = { totalSessions: 0, totalAttendees: 0 };

    const groupedByYear = yearlyStats.reduce((acc, stat) => {
      const { Year, TrainingCategory, NoOfSessions, TotalPeopleAttended } = stat;

      if (!acc[Year]) {
        acc[Year] = { 
          year: Year, 
          stats: [], 
          months: [], 
          consolidatedStats: { totalSessions: 0, totalAttendees: 0 },
          totalSessionsInYear: 0,  // New field for total sessions in the year
          totalAttendeesInYear: 0   // New field for total attendees in the year
        };
      }

      acc[Year].stats.push({ TrainingCategory, NoOfSessions, TotalPeopleAttended });

      // Aggregate overall stats for the year
      acc[Year].consolidatedStats.totalSessions += NoOfSessions;
      acc[Year].consolidatedStats.totalAttendees += TotalPeopleAttended;
      acc[Year].totalSessionsInYear += NoOfSessions;  // Add to year total
      acc[Year].totalAttendeesInYear += TotalPeopleAttended;  // Add to year total

      overallStats.totalSessions += NoOfSessions;
      overallStats.totalAttendees += TotalPeopleAttended;

      return acc;
    }, {});

    for (const year in groupedByYear) {
      const monthsWithWeeks = monthlyStats
        .filter(month => month.Year == year)
        .map(month => {
          const weeks = weeklyStats
            .filter(week => week.Year == year && week.MonthNumber === month.MonthNumber && week.TrainingCategory === month.TrainingCategory)
            .map(week => ({
              WeekNumber: week.WeekNumber,
              NoOfSessions: week.NoOfSessions,
              TotalPeopleAttended: week.TotalPeopleAttended,
            }))
            .sort((a, b) => b.WeekNumber - a.WeekNumber);

          return {
            ...month,
            MonthName: monthNames[month.MonthNumber - 1],
            weeks,
          };
        })
        .sort((a, b) => b.MonthNumber - a.MonthNumber);

      groupedByYear[year].months = monthsWithWeeks;

      // Include overall stats for the year in the response
      response.push({
        ...groupedByYear[year],
        NoOfSessions: groupedByYear[year].totalSessionsInYear,  // Add yearly total sessions
        TotalPeopleAttended: groupedByYear[year].totalAttendeesInYear,  // Add yearly total attendees
        overallStats: {
          totalSessions: groupedByYear[year].totalSessionsInYear,
          totalAttendees: groupedByYear[year].totalAttendeesInYear,
        }
      });
    }

    response.sort((a, b) => b.year - a.year); // Sort years in descending order

    res.status(200).json({
      status: true,
      message: 'Training summary data fetched successfully.',
      overallStats,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data.',
      error: error.message,
    });
  }
};


const trainingYearWiseCount = async (req, res) => {
  try {
    const { year, month, week, date, institutionName, trainingType } = req.body; // Optional filters

    // Base filters
    const filters = [];
    const params = [];

    // Handle year filter
    if (year) {
      filters.push("YEAR(sri.slotdate) = ?");
      params.push(year);
    }

    // Handle month filter
    if (month) {
      filters.push("MONTH(sri.slotdate) = ?");
      params.push(month);
    }

    // Handle week filter
    if (week) {
      filters.push("WEEK(sri.slotdate, 1) = ?");
      params.push(week);
    }

    // Handle date filter
    if (date) {
      filters.push("DATE(sri.slotdate) = ?");
      params.push(date);
    }

    // Handle institution name filter
    if (institutionName) {
      filters.push("sri.institution_name LIKE ?");
      params.push(`%${institutionName}%`);
    }

    // Handle training type filter
    if (trainingType) {
      filters.push("sri.category LIKE ?");
      params.push(`%${trainingType}%`);
    }

    // Combine all filters
    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to fetch data
    const query = `
      SELECT 
        YEAR(sri.slotdate) AS Year,
        MONTH(sri.slotdate) AS MonthNumber,
        WEEK(sri.slotdate, 1) AS WeekNumber,
        sri.slotdate AS SlotDate,
        sri.category AS TrainingType,
        sri.institution_name AS InstitutionName,
        sri.slotsession AS SlotSession,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM 
        slotregisterinfos sri
      INNER JOIN 
        bookingforms bf ON sri.sessionSlotId = bf.sessionSlotId
      WHERE 
        bf.training_status = 'Attended'
        ${filterCondition ? `AND ${filterCondition.substring(6)}` : ""}
      GROUP BY 
        YEAR(sri.slotdate), MONTH(sri.slotdate), WEEK(sri.slotdate, 1), sri.slotdate, sri.category, sri.institution_name, sri.slotsession
      ORDER BY 
        YEAR(sri.slotdate) DESC, MONTH(sri.slotdate) DESC, WEEK(sri.slotdate, 1) DESC;
    `;

    // Execute the query
    const [results] = await dbObj.query(query, params);

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No training data found.",
      });
    }

    // Initialize overall stats
    const overallStats = { totalSessions: 0, totalAttendees: 0 };

    // Transform data into the desired format
    const response = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const groupedByYear = results.reduce((acc, row) => {
      const year = row.Year;
      const monthName = monthNames[row.MonthNumber - 1];

      if (!acc[year]) {
        acc[year] = { 
          year, 
          stats: { totalSessions: 0, totalAttendees: 0 }, 
          months: [] 
        };
      }

      const monthIndex = acc[year].months.findIndex(m => m.MonthNumber === row.MonthNumber);
      if (monthIndex === -1) {
        acc[year].months.push({
          MonthNumber: row.MonthNumber,
          MonthName: monthName,
          details: [],
        });
      }

      const month = acc[year].months.find(m => m.MonthNumber === row.MonthNumber);
      month.details.push({
        SlotDate: row.SlotDate,
        TrainingType: row.TrainingType,
        InstitutionName: row.InstitutionName,
        SlotSession: row.SlotSession,
        NoOfSessions: row.NoOfSessions,
        TotalPeopleAttended: row.TotalPeopleAttended,
        WeekNumber: row.WeekNumber,
      });

      // Update year-level stats
      acc[year].stats.totalSessions += row.NoOfSessions;
      acc[year].stats.totalAttendees += row.TotalPeopleAttended;

      // Update overall stats
      overallStats.totalSessions += row.NoOfSessions;
      overallStats.totalAttendees += row.TotalPeopleAttended;

      return acc;
    }, {});

    for (const year in groupedByYear) {
      response.push({
        year,
        stats: groupedByYear[year].stats,
        months: groupedByYear[year].months,
      });
    }

    // Send the response
    res.status(200).json({
      status: true,
      message: "Training summary data fetched successfully.",
      overallStats, // Overall consolidated stats
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch training data.",
      error: error.message,
    });
  }
};






// const totalSessionsConducted = async (req, res) => {
//   try {
//     const {
//       page = 1, // Default to page 1 if not provided
//       pageSize = 50, // Default page size is 50
//       date,
//       schoolName,
//       trainer,
//       trainingType, // School / Adult
//       day,
//       week,
//       month,
//       financialYear,
//       rtoSubCategory,
//       slotType, // New filter for slotType
//     } = req.body;

//     const pageNum = parseInt(page, 10) || 1;
//     const limit = parseInt(pageSize, 10) || 50;
//     const offset = (pageNum - 1) * limit;

//     // Filters array to handle dynamic filtering
//     const filters = [];
//     const params = [];

//     // Filter for date (optional)
//     if (date) {
//       filters.push("DATE(bf.createdAt) = ?");
//       params.push(date);
//     }

//     // Filter for school/institute name (optional)
//     if (schoolName) {
//       filters.push("bf.institution_name LIKE ?");
//       params.push(`%${schoolName}%`);
//     }

//     // Filter for trainer (optional)
//     if (trainer) {
//       filters.push("ss.trainer LIKE ?");
//       params.push(`%${trainer}%`);
//     }

//     // Filter for School/Adult type (optional)
//     if (trainingType) {
//       filters.push(`
//         CASE 
//           WHEN bf.category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END = ?`);
//       params.push(trainingType);
//     }

//     // Filter for day (optional)
//     if (day) {
//       filters.push("DAYOFWEEK(bf.createdAt) = ?");
//       params.push(day);
//     }

//     // Filter for week (optional)
//     if (week) {
//       filters.push("WEEK(bf.createdAt, 1) = ?");
//       params.push(week);
//     }

//     // Filter for month (optional)
//     if (month) {
//       filters.push("MONTH(bf.createdAt) = ?");
//       params.push(month);
//     }

//     // Filter for financial year (optional)
//     if (financialYear) {
//       const startDate = `${financialYear}-04-01`;
//       const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
//       filters.push("bf.createdAt BETWEEN ? AND ?");
//       params.push(startDate, endDate);
//     }

//     // Filter for slotType (optional)
//     if (slotType) {
//       filters.push("ss.slotType = ?");
//       params.push(slotType);
//     }

//     // Combine filters into the query
//     const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

//     // Query to get total records (without pagination)
//     const totalItemsQuery = `
//       SELECT COUNT(*) AS rowCount
//       FROM bookingforms bf
//       JOIN sessionslots ss ON bf.sessionSlotId = ss.id
//       LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
//       ${filterCondition};
//     `;
//     const [totalResult] = await dbObj.query(totalItemsQuery, params);
//     const totalItems = totalResult[0]?.rowCount || 0;

//     // Calculate total pages
//     const totalPages = Math.ceil(totalItems / limit);

//     // Query to fetch paginated records (with pagination)
//     const paginatedQuery = `
//       SELECT
//         bf.*, sri.*, ss.*
//       FROM bookingforms bf
//       JOIN sessionslots ss ON bf.sessionSlotId = ss.id
//       LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
//       ${filterCondition}
//       LIMIT ? OFFSET ?;
//     `;
//     const [records] = await dbObj.query(paginatedQuery, [...params, limit, offset]);

//     // Prepare response
//     res.status(200).json({
//       status: true,
//       message: 'Records fetched successfully.',
//       data: records,
//       pagination: {
//         currentPage: pageNum,
//         pageSize: limit,
//         totalItems,
//         totalPages,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching paginated records:', error);
//     res.status(500).json({
//       status: false,
//       message: 'Failed to fetch records.',
//       error: error.message,
//     });
//   }
// };

const totalSessionsConducted = async (req, res) => {
  try {
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 50, // Default page size is 50
      date,
      schoolName,
      trainer,
      trainingType, // School / Adult
      day,
      week,
      month,
      financialYear,
      slotType, // New filter for slotType
      rtoFilter, // New filter for RTO category
      rtoSubCategory,
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    const filters = [];
    const params = [];

    filters.push("bf.training_status = ?");
    params.push("Attended");

    if (date) {
      filters.push("DATE(bf.createdAt) = ?");
      params.push(date);
    }

    if (schoolName) {
      filters.push("bf.institution_name LIKE ?");
      params.push(`%${schoolName}%`);
    }

    if (trainer) {
      filters.push("ss.trainer LIKE ?");
      params.push(`%${trainer}%`);
    }

    if (trainingType) {
      filters.push(`
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = ?`);
      params.push(trainingType);
    }

    if (day) {
      filters.push("DAYOFWEEK(bf.createdAt) = ?");
      params.push(day);
    }

    if (week) {
      filters.push("WEEK(bf.createdAt, 1) = ?");
      params.push(week);
    }

    if (month) {
      filters.push("MONTH(bf.createdAt) = ?");
      params.push(month);
    }

    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("bf.createdAt BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    if (slotType) {
      filters.push("ss.slotType = ?");
      params.push(slotType);
    }

    if (rtoFilter) {
      filters.push(`
        bf.category IN (
          'RTO – Learner Driving License Holder Training',
          'RTO – Suspended Driving License Holders Training',
          'RTO – Training for School Bus Driver'
        )
      `);
    }

    if (rtoSubCategory) {
      filters.push("bf.category = ?");
      params.push(rtoSubCategory);
    }

    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to count all rows matching the filters
    const totalRecordsQuery = `
      SELECT COUNT(*) AS totalRecords
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    // Query to get paginated records grouped by tempdate and time
    const paginatedQuery = `
      SELECT
        ss.tempdate AS tempDate,
        ss.time AS timeSlot,
        COUNT(*) AS sessionCount,
        bf.category AS categoryName,
        MONTHNAME(ss.tempdate) AS monthName,
        CASE
          WHEN MONTH(ss.tempdate) >= 4 THEN CONCAT(YEAR(ss.tempdate), '-', YEAR(ss.tempdate) + 1)
          ELSE CONCAT(YEAR(ss.tempdate) - 1, '-', YEAR(ss.tempdate))
        END AS financialYear,
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS trainingType,
        WEEK(ss.tempdate, 1) AS weekNumber,
        CASE
          WHEN bf.category IN (
            'RTO – Learner Driving License Holder Training',
            'RTO – Suspended Driving License Holders Training',
            'RTO – Training for School Bus Driver'
          ) THEN 'RTO'
          ELSE NULL
        END AS RTO,
        CASE
          WHEN bf.category = 'RTO – Learner Driving License Holder Training' THEN 'Learner'
          WHEN bf.category = 'RTO – Suspended Driving License Holders Training' THEN 'Suspended'
          WHEN bf.category = 'RTO – Training for School Bus Driver' THEN 'School Bus'
          ELSE NULL
        END AS rtoSubcategory,
        CONCAT(ss.tempdate, ' ', ss.time) AS slotDateTime,
        ss.id  AS slotId,
        CONCAT(ss.time, ' To ', ss.deadLineTime) AS slotTimeInfo,
        bf.*, ss.*, sri.*
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition}
      GROUP BY ss.tempdate, ss.time
      ORDER BY ss.tempdate DESC, ss.time ASC
      LIMIT ? OFFSET ?;
    `;
    const [records] = await dbObj.query(paginatedQuery, [...params, limit, offset]);

    // Prepare response
    res.status(200).json({
      status: true,
      message: 'Records fetched successfully.',
      data: records,
      totalSessionsConducted: totalRecords,
      pagination: {
        currentPage: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch records.',
      error: error.message,
    });
  }
};






const getInstituteNCategoryList = async (req, res) => {
  try {
    const { sessionSlotId, category, institution_name } = req.query; // Optional filters from query parameters

    // Build the WHERE condition for optional filters
    let filterCondition = '1'; // Default condition (select all records)
    const params = [];

    if (sessionSlotId) {
      filterCondition += ' AND sessionSlotId = ?';
      params.push(sessionSlotId);
    }
    if (category) {
      filterCondition += ' AND category = ?';
      params.push(category);
    }
    if (institution_name) {
      filterCondition += ' AND institution_name = ?';
      params.push(institution_name);
    }

    const query = `
      SELECT id, slotdate, sessionSlotId, slotsession, category, institution_name
      FROM slotregisterinfos
      WHERE ${filterCondition}
    `;

    // Use async/await for handling the query
    const [results] = await dbObj.query(query, params);

    // If no data is found, send a 404 response
    if (!results || results.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No data found with the provided filters.',
      });
    }

    // Return the results as a JSON response
    return res.status(200).json({
      status: true,
      message: 'Data fetched successfully.',
      data: results
    });
  } catch (error) {
    console.error('Error in getInstituteNCategoryList controller:', error);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while processing the request.',
      error: error.message
    });
  }
};

const trainerWiseSessionsConducted = async (req, res) => {
  try {
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 50, // Default page size is 50
      date,
      schoolName,
      trainer,
      trainingType, // School / Adult
      day,
      week,
      month,
      financialYear,
      slotType, // New filter for slotType
      rtoFilter, // Filter for RTO category
      rtoSubCategory, // New subfilter for specific RTO subcategories
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    // Filters array to handle dynamic filtering
    const filters = [];
    const params = [];

    filters.push("bf.training_status = ?");
    params.push("Attended");
    // Filter for date (optional)
    if (date) {
      filters.push("DATE(bf.createdAt) = ?");
      params.push(date);
    }

    // Filter for school/institute name (optional)
    if (schoolName) {
      filters.push("bf.institution_name LIKE ?");
      params.push(`%${schoolName}%`);
    }

    // Filter for trainer (optional)
    if (trainer) {
      filters.push("ss.trainer LIKE ?");
      params.push(`%${trainer}%`);
    }

    // Filter for School/Adult type (optional)
    if (trainingType) {
      filters.push(`
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = ?`);
      params.push(trainingType);
    }

    // Filter for day (optional)
    if (day) {
      filters.push("DAYOFWEEK(bf.createdAt) = ?");
      params.push(day);
    }

    // Filter for week (optional)
    if (week) {
      filters.push("WEEK(bf.createdAt, 1) = ?");
      params.push(week);
    }

    // Filter for month (optional)
    if (month) {
      filters.push("MONTH(bf.createdAt) = ?");
      params.push(month);
    }

    // Filter for financial year (optional)
    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("bf.createdAt BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // Filter for slotType (optional)
    if (slotType) {
      filters.push("ss.slotType = ?");
      params.push(slotType);
    }

    // Filter for RTO category (optional)
    if (rtoFilter) {
      filters.push(`
        bf.category IN (
          'RTO – Learner Driving License Holder Training',
          'RTO – Suspended Driving License Holders Training',
          'RTO – Training for School Bus Driver'
        )
      `);
    }

    // Filter for RTO subcategories (optional)
    if (rtoSubCategory) {
      filters.push("bf.category = ?");
      params.push(rtoSubCategory);
    }

    // Combine filters into the query
    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to count sessions by trainer and category for trainer-wise report
    const trainerWiseQuery = `
      SELECT
        ss.trainer AS trainerName,
        YEAR(bf.createdAt) AS year,
        MONTH(bf.createdAt) AS month,
        WEEK(bf.createdAt, 1) AS week,
        COUNT(*) AS sessionCount,
        bf.category AS categoryName
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition}
      GROUP BY ss.trainer, year, month, week, bf.category
      ORDER BY ss.trainer ASC, year DESC, month DESC, week DESC, bf.category ASC
      LIMIT ? OFFSET ?;
    `;

    const [records] = await dbObj.query(trainerWiseQuery, [...params, limit, offset]);

    // Query to count total records for pagination
    const totalRecordsQuery = `
      SELECT COUNT(*) AS totalRecords
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    // Month names for formatting
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Short name mapping for categories
    const categoryShortNames = {
      'RTO – Learner Driving License Holder Training': 'Learner',
      'RTO – Suspended Driving License Holders Training': 'Suspended',
      'RTO – Training for School Bus Driver': 'School BUS',
      // Add more categories as needed
    };

    // Prepare the response
    const result = [];

    records.forEach(record => {
      const { trainerName, year, month, week, sessionCount, categoryName } = record;

      // Initialize the trainer object if not already initialized
      let trainerObj = result.find(t => t.trainerName === trainerName);
      if (!trainerObj) {
        trainerObj = { trainerName, sessionCount: 0, years: [] };
        result.push(trainerObj);
      }

      // Add session count to the total sessions for the trainer
      trainerObj.sessionCount += sessionCount;

      // Find or create the year object within the trainer
      let yearObj = trainerObj.years.find(y => y.year === year);
      if (!yearObj) {
        yearObj = { year, sessionCount: 0, months: [] };
        trainerObj.years.push(yearObj);
      }

      // Add session count to the total sessions for the year
      yearObj.sessionCount += sessionCount;

      // Find or create the month object within the year
      let monthObj = yearObj.months.find(m => m.month === month);
      if (!monthObj) {
        monthObj = { 
          month, 
          monthName: monthNames[month - 1], 
          sessionCount: 0, 
          weeks: [],
          consolidatedSessions: { Learner: 0, Suspended: 0, 'School BUS': 0 } // Initialize consolidated counts
        };
        yearObj.months.push(monthObj);
      }

      // Add session count to the month
      monthObj.sessionCount += sessionCount;

      // Consolidate sessions by category at the month level
      if (categoryShortNames[categoryName]) {
        monthObj.consolidatedSessions[categoryShortNames[categoryName]] += sessionCount;
      }

      // Find or create the week object within the month
      let weekObj = monthObj.weeks.find(w => w.week === week);
      if (!weekObj) {
        weekObj = { 
          week, 
          sessionCount: 0, 
          categoryName,
          consolidatedSessions: { Learner: 0, Suspended: 0, 'School BUS': 0 } // Initialize consolidated counts for the week
        };

        // Adding the short name for category
        weekObj.shortName = categoryShortNames[categoryName] || categoryName;

        monthObj.weeks.push(weekObj);
      }

      // Add session count to the week
      weekObj.sessionCount += sessionCount;

      // Consolidate sessions by category at the week level
      if (categoryShortNames[categoryName]) {
        weekObj.consolidatedSessions[categoryShortNames[categoryName]] += sessionCount;
      }
    });

    res.status(200).json({
      status: true,
      message: 'Trainer-wise session count fetched successfully.',
      data: result, // Array of trainers with session count and breakdown by year, month, week
      totalSessionsConducted: totalRecords,
      pagination: {
        currentPage: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching trainer-wise records:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch trainer-wise records.',
      error: error.message,
    });
  }
};



const schoolWiseSessionsConducted = async (req, res) => {
  try {
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 50, // Default page size is 50
      date,
      schoolName,
      trainingType, // School / Adult
      day,
      week,
      month,
      financialYear,
      slotType, // Filter for slot type (optional)
      rtoFilter, // Filter for RTO category
      rtoSubCategory, // Filter for RTO subcategory
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    // Filters array to handle dynamic filtering
    const filters = [];
    const params = [];

    // Filter for date (optional)
    if (date) {
      filters.push("DATE(bf.createdAt) = ?");
      params.push(date);
    }

    // Filter for school/institution name (optional)
    if (schoolName) {
      filters.push("sri.institution_name LIKE ?");
      params.push(`%${schoolName}%`);
    }

    // Filter for School/Adult type (optional)
    if (trainingType) {
      filters.push(`
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = ?`);
      params.push(trainingType);
    }

    // Filter for day (optional)
    if (day) {
      filters.push("DAYOFWEEK(bf.createdAt) = ?");
      params.push(day);
    }

    // Filter for week (optional)
    if (week) {
      filters.push("WEEK(bf.createdAt, 1) = ?");
      params.push(week);
    }

    // Filter for month (optional)
    if (month) {
      filters.push("MONTH(bf.createdAt) = ?");
      params.push(month);
    }

    // Filter for financial year (optional)
    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("bf.createdAt BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // Filter for slotType (optional)
    if (slotType) {
      filters.push("ss.slotType = ?");
      params.push(slotType);
    }

    // Filter for RTO category (optional)
    if (rtoFilter) {
      filters.push(`
        bf.category IN (
          'RTO – Learner Driving License Holder Training',
          'RTO – Suspended Driving License Holders Training',
          'RTO – Training for School Bus Driver'
        )
      `);
    }

    // Filter for RTO subcategories (optional)
    if (rtoSubCategory) {
      filters.push("bf.category = ?");
      params.push(rtoSubCategory);
    }

    // Combine filters into the query
    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to count sessions by school name, year, month, and week
    const schoolWiseQuery = `
      SELECT
        sri.institution_name AS schoolName,
        YEAR(bf.createdAt) AS year,
        MONTH(bf.createdAt) AS month,
        WEEK(bf.createdAt, 1) AS week,
        COUNT(*) AS sessionCount
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition}
      GROUP BY sri.institution_name, year, month, week
      ORDER BY sri.institution_name ASC, year DESC, month DESC, week DESC;
    `;

    const [records] = await dbObj.query(schoolWiseQuery, params);

    // Query to count total records for pagination
    const totalRecordsQuery = `
      SELECT COUNT(*) AS totalRecords
      FROM bookingforms bf
      JOIN sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    // Format the result into the desired structure
    const result = {};

    records.forEach(record => {
      const { schoolName, year, month, week, sessionCount } = record;

      // Initialize the school object if not already initialized
      if (!result[schoolName]) {
        result[schoolName] = {
          schoolName,
          sessionCount: 0, // Total session count
          years: [] // Array for year-wise data
        };
      }

      // Add session count to the total sessions for the school
      result[schoolName].sessionCount += sessionCount;

      // Find or create the year object for this school
      let yearObj = result[schoolName].years.find(y => y.year === year);
      if (!yearObj) {
        yearObj = { year, sessionCount: 0, months: [] };
        result[schoolName].years.push(yearObj);
      }

      // Add session count to the year object
      yearObj.sessionCount += sessionCount;

      // Find or create the month object for the year
      let monthObj = yearObj.months.find(m => m.month === month);
      if (!monthObj) {
        monthObj = { month, monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }), sessionCount: 0, weeks: [] };
        yearObj.months.push(monthObj);
      }

      // Add session count to the month object
      monthObj.sessionCount += sessionCount;

      // Find or create the week object for the month
      let weekObj = monthObj.weeks.find(w => w.week === week);
      if (!weekObj) {
        weekObj = { week, sessionCount: 0 };
        monthObj.weeks.push(weekObj);
      }

      // Add session count to the week object
      weekObj.sessionCount += sessionCount;
    });

    // Prepare the response
    res.status(200).json({
      status: true,
      message: 'School-wise session count with monthly and weekly breakdown fetched successfully.',
      data: Object.values(result), // Returning the structured result
      totalSessionsConducted: totalRecords,
      pagination: {
        currentPage: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching school-wise records:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch school-wise records.',
      error: error.message,
    });
  }
};







module.exports = {schoolWiseSessionsConducted,trainerWiseSessionsConducted, getInstituteNCategoryList,trainingTypeWiseCount, trainingTypeWiseCountByCategory,trainingTypeWiseCountByYear,trainingTypeWiseCountByMonth,trainingTypeWiseCountByYearAll,trainingTypeWiseCountByYearAllAdult,trainingTypeWiseCountByYearAllSchool,trainingTypeWiseCountRTO,trainingYearWiseCount,totalSessionsConducted};
