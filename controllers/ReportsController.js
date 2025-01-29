const dbObj = require('../config/dbConfig');  // Import the MySQL pool
const ExcelJS = require('exceljs');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path')
/**
 * Controller for fetching training summary
 */
const excelJS = require("exceljs"); // Ensure you have exceljs installed in your project
const { log } = require('console');
const trainingTypeWiseCount = async (req, res) => {
  try {
    const { category, fromDate, toDate } = req.body; // Optional category, fromDate, and toDate parameters

    let query = `
      SELECT 
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended  -- Count of distinct people
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended'
    `;

    // Adding date filters if present
    if (fromDate && toDate) {
      query += ` AND bf.createdAt BETWEEN ? AND ?`;  // Assuming createdAt is the date field
    }

    // Adding category filter if present
    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN bf.category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }
    if (category && ['School', 'Adult'].includes(category)) {
      params.push(category);
    }

    const [result] = await dbObj.query(query, params);

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
    const { category, fromDate, toDate } = req.body; // Optional category, fromDate, and toDate parameters

    let query = `
      SELECT 
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended  -- Count of distinct people
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended'
    `;

    // Adding date filters if present
    if (fromDate && toDate) {
      query += ` AND bf.createdAt BETWEEN ? AND ?`;  // Assuming createdAt is the date field
    }

    // Adding category filter if present
    if (category && (category === 'School' || category === 'Adult')) {
      query += ` AND CASE 
                    WHEN bf.category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }
    if (category && (category === 'School' || category === 'Adult')) {
      params.push(category);
    }

    const [result] = await dbObj.query(query, params);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the category: ${category || 'all categories'}`,
      });
    }

    res.status(200).json({
      status: true,
      message: `Training summary for category '${category || 'all categories'}' fetched successfully.`,
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
    const { year, category, fromDate, toDate } = req.body; // Required: year, optional: category, fromDate, toDate

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
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended  -- Count of distinct people
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended' AND YEAR(bf.tempdate) = ?
    `;

    // Add date filters if provided
    if (fromDate && toDate) {
      query += ` AND bf.tempdate BETWEEN ? AND ?`;  // Assuming `tempdate` is the date field
    }

    // Add category filter if provided
    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN bf.category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    // Query to fetch overall totals
    let overallQuery = `
      SELECT 
        COUNT(DISTINCT bf.sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT bf.id) AS TotalAttendees
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended' AND YEAR(bf.tempdate) = ?
    `;

    if (fromDate && toDate) {
      overallQuery += ` AND bf.tempdate BETWEEN ? AND ?`;  // Assuming `tempdate` is the date field
    }

    if (category && ['School', 'Adult'].includes(category)) {
      overallQuery += ` AND CASE 
                          WHEN bf.category = 'School Students Training – Group' THEN 'School'
                          ELSE 'Adult'
                        END = ?`;
    }

    // Execute both queries
    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }
    params.push(year);
    if (category && ['School', 'Adult'].includes(category)) {
      params.push(category);
    }

    const [result] = await dbObj.query(query, params);
    const [overallResult] = await dbObj.query(overallQuery, params);

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
    const { year, month, category, fromDate, toDate } = req.body; // Required: year, month, optional: category, fromDate, toDate

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
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended  -- Count of distinct people
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended' AND YEAR(bf.tempdate) = ? AND MONTH(bf.tempdate) = ?
    `;

    // Add date filters if provided
    if (fromDate && toDate) {
      query += ` AND bf.tempdate BETWEEN ? AND ?`;  // Assuming `tempdate` is the date field
    }

    // Add category filter if provided
    if (category && ['School', 'Adult'].includes(category)) {
      query += ` AND CASE 
                    WHEN bf.category = 'School Students Training – Group' THEN 'School'
                    ELSE 'Adult'
                  END = ?`;
    }

    query += ` GROUP BY TrainingType;`;

    // Query to fetch overall totals for the month
    let overallQuery = `
      SELECT 
        COUNT(DISTINCT bf.sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT bf.id) AS TotalAttendees
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id  -- Join with Sessionslots table
      WHERE bf.training_status = 'Attended' AND YEAR(bf.tempdate) = ? AND MONTH(bf.tempdate) = ?
    `;

    if (fromDate && toDate) {
      overallQuery += ` AND bf.tempdate BETWEEN ? AND ?`;  // Assuming `tempdate` is the date field
    }

    if (category && ['School', 'Adult'].includes(category)) {
      overallQuery += ` AND CASE 
                          WHEN bf.category = 'School Students Training – Group' THEN 'School'
                          ELSE 'Adult'
                        END = ?`;
    }

    // Execute both queries
    const params = [];
    if (fromDate && toDate) {
      params.push(fromDate, toDate);
    }
    params.push(year, month);
    if (category && ['School', 'Adult'].includes(category)) {
      params.push(category);
    }

    const [result] = await dbObj.query(query, params);
    const [overallResult] = await dbObj.query(overallQuery, params);

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


const trainingTypeWiseCountByYearAll = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { trainingType, year, month, week, download,   fromDate,
      toDate } = req.body; // Optional filters

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
      filters.push("YEAR(tempdate) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(tempdate) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(tempdate, 1) = ?");
      params.push(week);
    }

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }
    // Combine all filters
    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Overall stats query
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT sessionSlotId) AS TotalSessions,
        COUNT(DISTINCT id) AS TotalAttendees
      FROM BookingForms
      WHERE training_status = 'Attended' ${filterCondition};
    `;

    // Queries with dynamic filters
    const yearlyStatsQuery = `
      SELECT 
        YEAR(tempdate) AS Year,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM BookingForms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, TrainingType
      HAVING Year = ?;
    `;

    const monthlyStatsQuery = `
      SELECT 
        YEAR(tempdate) AS Year,
        MONTH(tempdate) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM BookingForms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, TrainingType
      HAVING Year = ?;
    `;

    const weeklyStatsQuery = `
      SELECT 
        YEAR(tempdate) AS Year,
        WEEK(tempdate, 1) AS WeekNumber,
        MONTH(tempdate) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType
      FROM BookingForms
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

    const { year, month, week,fromDate,toDate } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    if (year) {
      filters.push("YEAR(bf.tempdate) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    // Filter for specific RTO categories
    filters.push(`
      CASE 
        WHEN bf.category = 'School Students Training – Group' THEN 'School'
        ELSE 'Adult'
      END = 'Adult'
    `);

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Query for yearly stats
    const yearlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, bf.category;
    `;

    // Query for monthly stats
    const monthlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, bf.category;
    `;

    // Query for weekly stats
    const weeklyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        WEEK(bf.tempdate, 1) AS WeekNumber,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, bf.category;
    `;

    // Execute the queries to get the stats
    const [yearlyStats] = await dbObj.query(yearlyStatsQuery, params);
    const [monthlyStats] = await dbObj.query(monthlyStatsQuery, params);
    const [weeklyStats] = await dbObj.query(weeklyStatsQuery, params);




    // If no data is found for yearly stats, return a 404 response
    if (!yearlyStats.length) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    const response = [];
    const overallStats = { totalSessions: 0, totalAttendees: 0 };

    // Create a map to hold category labels and their corresponding sessions
    const categoryLabels = {
      'RTO – Learner Driving License Holder Training': 'Adult',
      'RTO – Suspended Driving License Holders Training': 'Adult',
      'RTO – Training for School Bus Driver': 'Adult'      
    };

    // Group and aggregate the yearly stats
    const groupedByYear = yearlyStats.reduce((acc, stat) => {
      const { Year, TrainingCategory, NoOfSessions, TotalPeopleAttended } = stat;
      const categoryLabel = categoryLabels[TrainingCategory] || 'Other';

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

      acc[Year].stats.push({
        categoryLabel, // Add the label to the stats
        TrainingCategory,
        NoOfSessions,
        TotalPeopleAttended
      });

      // Aggregate overall stats for the year
      acc[Year].consolidatedStats.totalSessions += NoOfSessions;
      acc[Year].consolidatedStats.totalAttendees += TotalPeopleAttended;
      acc[Year].totalSessionsInYear += NoOfSessions;  // Add to year total
      acc[Year].totalAttendeesInYear += TotalPeopleAttended;  // Add to year total

      overallStats.totalSessions += NoOfSessions;
      overallStats.totalAttendees += TotalPeopleAttended;

      return acc;
    }, {});

    // Now, process the monthly and weekly stats
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

    // Sort the response by year in descending order
    response.sort((a, b) => b.year - a.year); 

    // Send the response
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



const trainingTypeWiseCountRTO = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { year, month, week,fromDate,toDate } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    if (year) {
      filters.push("YEAR(bf.tempdate) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    // Filter for specific RTO categories
    filters.push(`
      bf.category IN ('RTO – Learner Driving License Holder Training', 
                      'RTO – Suspended Driving License Holders Training', 
                      'RTO – Training for School Bus Driver')
    `);

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Query for yearly stats
    const yearlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, bf.category;
    `;

    // Query for monthly stats
    const monthlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, bf.category;
    `;

    // Query for weekly stats
    const weeklyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        WEEK(bf.tempdate, 1) AS WeekNumber,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, bf.category;
    `;

    // Execute the queries to get the stats
    const [yearlyStats] = await dbObj.query(yearlyStatsQuery, params);
    const [monthlyStats] = await dbObj.query(monthlyStatsQuery, params);
    const [weeklyStats] = await dbObj.query(weeklyStatsQuery, params);




    // If no data is found for yearly stats, return a 404 response
    if (!yearlyStats.length) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    const response = [];
    const overallStats = { totalSessions: 0, totalAttendees: 0 };

    // Create a map to hold category labels and their corresponding sessions
    const categoryLabels = {
      'RTO – Learner Driving License Holder Training': 'Learner',
      'RTO – Suspended Driving License Holders Training': 'Suspended',
      'RTO – Training for School Bus Driver': 'School Bus'
    };

    // Group and aggregate the yearly stats
    const groupedByYear = yearlyStats.reduce((acc, stat) => {
      const { Year, TrainingCategory, NoOfSessions, TotalPeopleAttended } = stat;
      const categoryLabel = categoryLabels[TrainingCategory] || 'Other';

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

      acc[Year].stats.push({
        categoryLabel, // Add the label to the stats
        TrainingCategory,
        NoOfSessions,
        TotalPeopleAttended
      });

      // Aggregate overall stats for the year
      acc[Year].consolidatedStats.totalSessions += NoOfSessions;
      acc[Year].consolidatedStats.totalAttendees += TotalPeopleAttended;
      acc[Year].totalSessionsInYear += NoOfSessions;  // Add to year total
      acc[Year].totalAttendeesInYear += TotalPeopleAttended;  // Add to year total

      overallStats.totalSessions += NoOfSessions;
      overallStats.totalAttendees += TotalPeopleAttended;

      return acc;
    }, {});

    // Now, process the monthly and weekly stats
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

    // Sort the response by year in descending order
    response.sort((a, b) => b.year - a.year); 

    // Send the response
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



const trainingTypeWiseCountByYearAllSchool = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = 2007;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const { year, month, week,fromDate,toDate } = req.body; // Optional filters

    // Base conditions for filters
    const filters = [];
    const params = [];

    if (year) {
      filters.push("YEAR(bf.tempdate) = ?");
      params.push(year);
    }

    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    filters.push(`
      CASE 
        WHEN bf.category = 'School Students Training – Group' THEN 'School'
        ELSE 'Adult'
      END = 'School'
    `);

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    const filterCondition = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

    // Query for yearly stats
    const yearlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, bf.category;
    `;

    // Query for monthly stats
    const monthlyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, MonthNumber, bf.category;
    `;

    // Query for weekly stats
    const weeklyStatsQuery = `
      SELECT 
        YEAR(bf.tempdate) AS Year,
        WEEK(bf.tempdate, 1) AS WeekNumber,
        MONTH(bf.tempdate) AS MonthNumber,
        bf.category AS TrainingCategory,
        COUNT(DISTINCT bf.sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT bf.id) AS TotalPeopleAttended
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      WHERE bf.training_status = 'Attended' ${filterCondition}
      GROUP BY Year, WeekNumber, MonthNumber, bf.category;
    `;

    // Execute the queries to get the stats
    const [yearlyStats] = await dbObj.query(yearlyStatsQuery, params);
    const [monthlyStats] = await dbObj.query(monthlyStatsQuery, params);
    const [weeklyStats] = await dbObj.query(weeklyStatsQuery, params);




    // If no data is found for yearly stats, return a 404 response
    if (!yearlyStats.length) {
      return res.status(404).json({
        status: false,
        message: 'No training summary data found for the provided filters.',
      });
    }

    const response = [];
    const overallStats = { totalSessions: 0, totalAttendees: 0 };

    // Create a map to hold category labels and their corresponding sessions
    const categoryLabels = {      
      'School Students Training – Group': 'School'
    };

    // Group and aggregate the yearly stats
    const groupedByYear = yearlyStats.reduce((acc, stat) => {
      const { Year, TrainingCategory, NoOfSessions, TotalPeopleAttended } = stat;
      const categoryLabel = categoryLabels[TrainingCategory] || 'Other';

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

      acc[Year].stats.push({
        categoryLabel, // Add the label to the stats
        TrainingCategory,
        NoOfSessions,
        TotalPeopleAttended
      });

      // Aggregate overall stats for the year
      acc[Year].consolidatedStats.totalSessions += NoOfSessions;
      acc[Year].consolidatedStats.totalAttendees += TotalPeopleAttended;
      acc[Year].totalSessionsInYear += NoOfSessions;  // Add to year total
      acc[Year].totalAttendeesInYear += TotalPeopleAttended;  // Add to year total

      overallStats.totalSessions += NoOfSessions;
      overallStats.totalAttendees += TotalPeopleAttended;

      return acc;
    }, {});

    // Now, process the monthly and weekly stats
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

    // Sort the response by year in descending order
    response.sort((a, b) => b.year - a.year); 

    // Send the response
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
    const {
      page = 1,
      pageSize = 50,
      date,
      schoolName,
      trainingType, // School / Adult
      day,
      week,
      month,
      financialYear,
      slotType, // New filter for slotType
      rtoFilter, // Filter for RTO category
      rtoSubCategory, // New subfilter for specific RTO subcategories
      fromDate,
      toDate,
      download = false, 
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    const filters = [];
    const params = [];

    // Short name mapping for RTO categories
    const categoryShortNames = {
      'RTO – Learner Driving License Holder Training': 'Learner',
      'RTO – Suspended Driving License Holders Training': 'Suspended',
      'RTO – Training for School Bus Driver': 'School BUS',
    };

    // Month name mapping
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (date) {
      filters.push("DATE(sri.slotdate) = ?");
      params.push(date);
    }

    if (schoolName) {
      filters.push("sri.institution_name LIKE ?");
      params.push(`%${schoolName}%`);
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
      filters.push("DAYOFWEEK(sri.slotdate) = ?");
      params.push(day);
    }

    if (week) {
      filters.push("WEEK(sri.slotdate, 1) = ?");
      params.push(week);
    }

    if (month) {
      filters.push("MONTH(sri.slotdate) = ?");
      params.push(month);
    }

    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("sri.slotdate BETWEEN ? AND ?");
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

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    // Apply the "Attended" filter for BookingForms only at the last stage
    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")} AND bf.training_status = 'Attended'` : "WHERE bf.training_status = 'Attended'";

    const query = `
      SELECT
        sri.institution_name AS instituteName,
        YEAR(sri.slotdate) AS year,
        MONTH(sri.slotdate) AS month,
        WEEK(sri.slotdate, 1) AS week,
        bf.category AS category,
        COUNT(*) AS sessionCount,
        COUNT(DISTINCT bf.sessionSlotId) AS totalSessions
      FROM slotregisterinfos sri
      LEFT JOIN Sessionslots ss ON sri.sessionSlotId = ss.id
      LEFT JOIN BookingForms bf ON ss.id = bf.sessionSlotId
      ${filterCondition}
      GROUP BY sri.institution_name, year, month, week, bf.category
      ORDER BY sri.institution_name, year DESC, month DESC, week DESC
      LIMIT ? OFFSET ?;
    `;

    const [records] = await dbObj.query(query, [...params, limit, offset]);

    const totalRecordsQuery = `
      SELECT COUNT(DISTINCT sri.institution_name) AS totalRecords
      FROM slotregisterinfos sri
      LEFT JOIN Sessionslots ss ON sri.sessionSlotId = ss.id
      LEFT JOIN BookingForms bf ON ss.id = bf.sessionSlotId
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;
    const years = [...new Set(records.map(record => record.year))].sort((a, b) => b - a);

    // Format the response with short names applied for RTO
    const groupedData = records.reduce((acc, record) => {
      const { instituteName, year, month, week, category, sessionCount, totalSessions } = record;

      // Replace category name with short name if RTO filter is applied
      const categoryShort = rtoFilter && categoryShortNames[category] ? categoryShortNames[category] : category;

      let institute = acc.find((i) => i.instituteName === instituteName);
      if (!institute) {
        institute = {
          instituteName,
          sessionCount: 0, // To accumulate session count for the entire institute
          totalSessions: 0, // To accumulate total sessions for the entire institute
          years: [],
        };
        acc.push(institute);
      }

      // Aggregate session count and total sessions at the institute level
      institute.sessionCount += sessionCount;
      institute.totalSessions += totalSessions;

      let yearData = institute.years.find((y) => y.year === year);
      if (!yearData) {
        yearData = { year, sessionCount: 0, totalSessions: 0, months: [] };
        institute.years.push(yearData);
      }

      // Aggregate session count and total sessions at the year level
      yearData.sessionCount += sessionCount;
      yearData.totalSessions += totalSessions;

      const trainingType = categoryShort.includes("School") ? "School" : "Adult";
      let trainingTypeData = yearData.months.find((m) => m.month === month);
      if (!trainingTypeData) {
        trainingTypeData = {
          month,
          monthName: monthNames[month - 1], // Add monthName
          sessionCount: 0, // Initialize session count
          totalSessions: 0, // Initialize totalSessions
          weeks: []
        };
        yearData.months.push(trainingTypeData);
      }

      // Aggregate session count and total sessions at the month level
      trainingTypeData.sessionCount += sessionCount;
      trainingTypeData.totalSessions += totalSessions;

      let weekData = trainingTypeData.weeks.find((w) => w.week === week);
      if (!weekData) {
        weekData = { week, categories: [] };
        trainingTypeData.weeks.push(weekData);
      }

      weekData.categories.push({ category: categoryShort, sessionCount, totalSessions });
      return acc;
    }, []);

    // Flatten the data for Excel export
    const flattenedData = records.map(record => flattenJson(record));

    // Format data for Excel export if download is true
    if (download) {
      const ws = xlsx.utils.json_to_sheet(flattenedData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Training Data');

      const fileName = 'Training_Yearwise_Data.xlsx';
      const fileBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers and send the file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(fileBuffer);
    } else {
      res.status(200).json({
        status: true,
        message: "Year-wise session count fetched successfully.",
        data: groupedData,
        totalSessionsConducted: totalRecords,
        pagination: {
          currentPage: pageNum,
          pageSize: limit,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching year-wise records:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch year-wise records.",
      error: error.message,
    });
  }
};

const flattenJson = (obj, parent = '', res = {}) => {
  for (let key in obj) {
    const propName = parent ? `${parent}_${key}` : key;
    
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
      flattenJson(obj[key], propName, res); // Recurse if it's an object
    } else {
      res[propName] = obj[key]; // Direct assignment for primitive types
    }
  }
  return res;
};


const totalSessionsConducted = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 50,
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
      fromDate,
      toDate,
      download = false, // New flag for downloading data
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    const filters = [];
    const params = [];

    filters.push("bf.training_status = ?");
    params.push("Attended");

    if (date) {
      filters.push("DATE(bf.tempdate) = ?");
      params.push(date);
    }

    if (schoolName) {
      filters.push("sri.institution_name LIKE ?");
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
        END = ?
      `);
      params.push(trainingType);
    }

    if (day) {
      filters.push("DAYOFWEEK(bf.tempdate) = ?");
      params.push(day);
    }

    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
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

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to count all rows matching the filters
    const totalRecordsQuery = `
      SELECT COUNT(DISTINCT bf.sessionSlotId) AS totalRecords
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    // Query to get records
    const dataQuery = `
      SELECT
        bf.*,  
        ss.*,  
        sri.*,
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
        ss.id AS slotId,
        CONCAT(ss.time, ' To ', ss.deadLineTime) AS slotTimeInfo,
         CASE
          WHEN bf.institution_name IS NULL OR bf.institution_name = '' THEN
            CASE
              WHEN bf.category IN (
                'RTO – Learner Driving License Holder Training',
                'RTO – Suspended Driving License Holders Training',
                'RTO – Training for School Bus Driver'
              ) THEN  bf.category
              ELSE sri.institution_name
            END
          ELSE bf.institution_name
        END AS institutionOrCategory
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition}
      GROUP BY bf.sessionSlotId
      ORDER BY ss.id DESC
      ${download ? "" : "LIMIT ? OFFSET ?"};
    `;
    const [records] = await dbObj.query(dataQuery, download ? params : [...params, limit, offset]);

    if (download) {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Total Sessions");    
      // Define the column structure explicitly
      worksheet.columns = [
        { header: "Date", key: "tempDate", width: 15 },
        { header: "Time", key: "slotTimeInfo", width: 15 },
        { header: "School / Institution", key: "institutionOrCategory", width: 30 },
        { header: "No.Of Students", key: "sessionCount", width: 15 },
        { header: "Phone No.", key: "institution_phone", width: 15 },
        { header: "Email I.D.", key: "institution_email", width: 25 },
        { header: "H.M. / Main Co-ordinator", key: "hm_principal_manager_name", width: 25 },
        { header: "Mobile No.1", key: "hm_principal_manager_mobile", width: 15 },
        { header: "Teacher / Sub Co-ordinator", key: "coordinator_name", width: 25 },
        { header: "Mobile No.2", key: "coordinator_mobile", width: 15 },
        { header: "Trainer", key: "trainer", width: 15 },
        { header: "SCHOOL / ADULT", key: "trainingType", width: 15 },
        { header: "Location", key: "slotType", width: 20 },
        { header: "Week", key: "weekNumber", width: 10 },
        { header: "Month", key: "monthName", width: 10 },
        { header: "F.Y.", key: "financialYear", width: 10 },
        { header: "RTO", key: "RTO", width: 10 },
        { header: "RTO Sub Category", key: "rtoSubcategory", width: 20 },
      ];
      // Add records to the worksheet
      if (records.length > 0) {
        records.forEach((record) => worksheet.addRow(record));
      }
    
      const now = new Date();
      const todaysDate = `${now.getDate().toString().padStart(2, '0')}${now.getMonth() + 1}` +
        `${now.getFullYear()}${now.getHours().toString().padStart(2, '0')}` +
        `${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`; 
      console.log(todaysDate);      res.setHeader(
        "Content-Disposition",
        `attachment; filename=TotalSessions${todaysDate}.xlsx`
      );
      // res.setHeader(
      //   "Content-Type",
      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      // );

      // const now = new Date();
      // const todaysDate = `${now.getDate().toString().padStart(2, '0')}${now.getMonth() + 1}` +
      //   `${now.getFullYear()}${now.getHours().toString().padStart(2, '0')}` +
      //   `${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`; 
      // console.log(todaysDate);      res.setHeader(
      //   "Content-Disposition",
      //   `attachment; filename=TotalSessions${todaysDate}.xlsx`
      // );
    
      // await workbook.xlsx.write(res);
      // return res.status(200).end();

      // res.setHeader(
      //   "Content-Type",
      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      // );
      // res.setHeader(
      //   "Content-Disposition",
      //   `attachment; filename=TotalSessions${todaysDate}.xlsx`
      // );
      
      // await workbook.xlsx.write(res);
      // return res.end(); // Explicitl

      res.setHeader('Content-Disposition', `attachment; filename="TotalSessions${generateTimestampIST()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
     // return res.send(buffer);
      await workbook.xlsx.write(res);
      res.end();
    }
  
    // Prepare response
    res.status(200).json({
      status: true,
      message: "Records fetched successfully.",
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
    console.error("Error fetching records:", error);
    // res.status(500).json({
    //   status: false,
    //   message: "Failed to fetch records.",
    //   error: error.message,
    // });
  }
};

function generateTimestampIST() {
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata' };

  // Get the current date and time in IST
  const day = now.toLocaleString('en-GB', { ...options, day: '2-digit' });
  const month = now.toLocaleString('en-GB', { ...options, month: '2-digit' });
  const year = now.toLocaleString('en-GB', { ...options, year: '2-digit' });
  const hours = now.toLocaleString('en-GB', { ...options, hour: '2-digit', hour12: false });
  const minutes = now.toLocaleString('en-GB', { ...options, minute: '2-digit' });
  const seconds = now.toLocaleString('en-GB', { ...options, second: '2-digit' });
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

  // Format the timestamp as DDMMYYHHMMSSSSS
  return `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
}

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
      WHERE ${filterCondition} group by institution_name
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
      page = 1,
      pageSize = 50,
      date,
      schoolName,
      trainer,
      trainingType,
      day,
      week,
      month,
      financialYear,
      slotType,
      rtoFilter,
      rtoSubCategory,
      fromDate,
      toDate,
      download = false,
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    const filters = [];
    const params = [];

    if (date) {
      filters.push("DATE(bf.tempdate) = ?");
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
      filters.push("DAYOFWEEK(bf.tempdate) = ?");
      params.push(day);
    }

    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
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
        )`);
    }

    if (rtoSubCategory) {
      filters.push("bf.category = ?");
      params.push(rtoSubCategory);
    }

    filters.push("bf.training_status = ?");
    params.push("Attended");

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const trainerWiseQuery = `
      SELECT
        IFNULL(NULLIF(ss.trainer, ''), 'UnknownTrainer') AS trainerName,
        YEAR(ss.tempdate) AS year,
        MONTH(ss.tempdate) AS month,
        WEEK(ss.tempdate, 1) AS week,
        COUNT(*) AS sessionCount,
        COUNT(DISTINCT bf.sessionSlotId) AS totalSessions,
        bf.category AS categoryName
      FROM Sessionslots ss
      LEFT JOIN BookingForms bf ON ss.id = bf.sessionSlotId
      ${filterCondition}
      GROUP BY trainerName, year, month, week, bf.category
      ORDER BY trainerName ASC, year DESC, month DESC, week DESC, bf.category ASC
      LIMIT ? OFFSET ?;
    `;

    const [records] = await dbObj.query(trainerWiseQuery, [...params, limit, offset]);

    if (records.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'No data found for trainer-wise session count.',
        data: [],
      });
    }

    const totalRecordsQuery = `
      SELECT COUNT(DISTINCT ss.trainer) AS totalRecords
      FROM Sessionslots ss
      LEFT JOIN BookingForms bf ON ss.id = bf.sessionSlotId
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const categoryShortNames = {
      'RTO – Learner Driving License Holder Training': 'Learner',
      'RTO – Suspended Driving License Holders Training': 'Suspended',
      'RTO – Training for School Bus Driver': 'School BUS',
    };

    const trainerJson = {};

    records.forEach(record => {
      const { trainerName, year, month, week, sessionCount, categoryName, totalSessions } = record;

      if (!trainerJson[trainerName]) {
        trainerJson[trainerName] = {
          trainerName,
          years: [],
        };
      }

      const trainerObj = trainerJson[trainerName];

      let yearObj = trainerObj.years.find(y => y.year === year);
      if (!yearObj) {
        yearObj = { 
          year, 
          months: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthName: monthNames[i],
            sessionCount: 0,
            totalSessions: 0,
            weeks: [],
            consolidatedSessions: { Learner: 0, Suspended: 0, 'School BUS': 0 },
          }))
        };
        trainerObj.years.push(yearObj);
      }

      const monthObj = yearObj.months.find(m => m.month === month);

      let weekObj = monthObj.weeks.find(w => w.week === week);
      if (!weekObj) {
        weekObj = {
          week,
          sessionCount: 0,
          totalSessions: 0,
          categoryName,
          shortName: categoryShortNames[categoryName] || categoryName,
          consolidatedSessions: { Learner: 0, Suspended: 0, 'School BUS': 0 },
        };
        monthObj.weeks.push(weekObj);
      }

      weekObj.sessionCount += sessionCount;
      weekObj.totalSessions += totalSessions;
      monthObj.consolidatedSessions[categoryShortNames[categoryName] || categoryName] += sessionCount;
      monthObj.sessionCount += sessionCount;
      monthObj.totalSessions += totalSessions;
    });

    // Remove months with sessionCount = 0
    Object.values(trainerJson).forEach(trainer => {
      trainer.years.forEach(year => {
        year.months = year.months.filter(month => month.sessionCount > 0);
      });
    });

    if (download) {
      let rows = [];

      // Define headers for the Excel file
      rows.push(['Trainer Name', 'Session Count', 'Total Sessions', 'Year', 'Month', 'Month Name', 'Week', 'Category']);

      const dataObj = Object.values(trainerJson);

      dataObj.forEach(trainer => {
        trainer.years.forEach(year => {
          year.months.forEach(month => {
            month.weeks.forEach(week => {
              // Add a row for each week with relevant data
              rows.push([
                trainer.trainerName,                     // Trainer Name
                week.sessionCount,                       // Session Count for the week
                week.totalSessions,                      // Total Sessions for the week
                year.year,                               // Year
                month.month,                             // Month number
                month.monthName,                         // Month Name
                week.week || 'N/A',                      // Week or N/A if not present
                week.shortName || week.categoryName,     // Category Name (shortened if available)
              ]);
            });
          });
        });
      });

      // Create Excel sheet
      const ws = xlsx.utils.aoa_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Trainer Sessions');

      // Write to a buffer first
      const buffer = await xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="TrainerWiseSessions_${generateTimestampIST()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the buffer as response
      res.end(buffer);
    } else {
      res.status(200).json({
        status: true,
        message: 'Trainer-wise session count fetched successfully.',
        data: Object.values(trainerJson),
        totalSessionsConducted: totalRecords,
        pagination: {
          currentPage: pageNum,
          pageSize: limit,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords,
        },
      });
    }

  
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
      slotType, 
      fromDate, // Filter for start date
      toDate,  
      download=false// Filter for slot type (optional)
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    // Filters array to handle dynamic filtering
    const filters = [];
    const params = [];

    // Filter for attended status
    filters.push("bf.training_status = ?");
    params.push("Attended");

    // Default filter for specific categories (School Students Training – Group, College/Organization Training – Group)
    filters.push("bf.category IN (?, ?)");
    params.push('School Students Training – Group', 'College/Organization Training – Group');
    filters.push("sri.institution_name IS NOT NULL AND sri.institution_name != ''");

    // If any other category filter is provided, override the default category filter
    if (req.body.category) {
      filters.push("bf.category = ?");
      params.push(req.body.category);
    }

    // Filter for date (optional)
    if (date) {
      filters.push("DATE(bf.tempdate) = ?");
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
      filters.push("DAYOFWEEK(bf.tempdate) = ?");
      params.push(day);
    }

    // Filter for week (optional)
    if (week) {
      filters.push("WEEK(bf.tempdate, 1) = ?");
      params.push(week);
    }

    // Filter for month (optional)
    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }

    // Filter for financial year (optional)
    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }

    // Filter for slotType (optional)
    if (slotType) {
      filters.push("ss.slotType = ?");
      params.push(slotType);
    }


     // **Apply the fromDate and toDate filters at the end**
    //  if (fromDate) {
    //   filters.push("bf.tempdate >= ?");
    //   params.push(fromDate);
    // }

    // if (toDate) {
    //   filters.push("bf.tempdate <= ?");
    //   params.push(toDate);
    // }

    if (fromDate && toDate) {
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    }

    // Combine filters into the query
    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Query to count sessions by school name, year, month, and week
    const schoolWiseQuery = `
      SELECT
        sri.institution_name AS schoolName,
        YEAR(bf.tempdate) AS year,
        MONTH(bf.tempdate) AS month,
        WEEK(bf.tempdate, 1) AS week,
        COUNT(*) AS sessionCount,
        COUNT(DISTINCT bf.sessionSlotId) AS totalSessions
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition}
      GROUP BY sri.institution_name, year, month, week
      ORDER BY sri.institution_name ASC, year DESC, month DESC, week DESC;
    `;

    const [records] = await dbObj.query(schoolWiseQuery, params);

    // Query to count total records for pagination
    const totalRecordsQuery = `
      SELECT COUNT(DISTINCT sri.institution_name) AS totalRecords
      FROM BookingForms bf
      JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
      LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
      ${filterCondition};
    `;
    const [totalRecordsResult] = await dbObj.query(totalRecordsQuery, params);
    const totalRecords = totalRecordsResult[0]?.totalRecords || 0;

    // Format the result into the desired structure
    const result = {};

    records.forEach(record => {
      const { schoolName, year, month, week, sessionCount, totalSessions } = record;

      // Initialize the school object if not already initialized
      if (!result[schoolName]) {
        result[schoolName] = {
          schoolName,
          sessionCount: 0, // Total session count
          totalSessions: 0, // Total distinct sessions
          years: [] // Array for year-wise data
        };
      }

      // Add session count and totalSessions to the school object
      result[schoolName].sessionCount += sessionCount;
      result[schoolName].totalSessions += totalSessions;

      // Find or create the year object for this school
      let yearObj = result[schoolName].years.find(y => y.year === year);
      if (!yearObj) {
        yearObj = { year, sessionCount: 0, totalSessions: 0, months: [] };
        result[schoolName].years.push(yearObj);
      }

      // Add session count and totalSessions to the year object
      yearObj.sessionCount += sessionCount;
      yearObj.totalSessions += totalSessions;

      // Find or create the month object for the year
      let monthObj = yearObj.months.find(m => m.month === month);
      if (!monthObj) {
        monthObj = { 
          month, 
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          sessionCount: 0,
          totalSessions: 0,
          weeks: [] 
        };
        yearObj.months.push(monthObj);
      }

      // Add session count and totalSessions to the month object
      monthObj.sessionCount += sessionCount;
      monthObj.totalSessions += totalSessions;

      // Find or create the week object for the month
      let weekObj = monthObj.weeks.find(w => w.week === week);
      if (!weekObj) {
        weekObj = { week, sessionCount: 0, totalSessions: 0 };
        monthObj.weeks.push(weekObj);
      }

      // Add session count and totalSessions to the week object
      weekObj.sessionCount += sessionCount;
      weekObj.totalSessions += totalSessions;
    });
    if (download) {
      let rows = [];
    
      // Define headers for Excel file
      rows.push(['School Name', 'Session Count', 'Total Sessions', 'Year', 'Month', 'Month Name', 'Week']);  
    
      const dataObj = Object.values(result);
    
      dataObj.forEach(school => {
        school.years.forEach(year => {
          year.months.forEach(month => {
            month.weeks.forEach(week => {
              // Add a row for each week with relevant data
              rows.push([
                school.schoolName,                     // School Name
                month.sessionCount,                    // Session Count for the month
                month.totalSessions,                   // Total Sessions for the month
                year.year,                             // Year
                month.month,                           // Month number
                month.monthName,                       // Month Name
                week.week || 'N/A',                    // Week or N/A if not present
              ]);
            });
          });
        });
      });
    
      const ws = xlsx.utils.aoa_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'School Sessions');
      
      // Write to a buffer first
      const buffer = await xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="SchoolWiseReports_${generateTimestampIST()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
      // Send the buffer as response
      res.end(buffer);
    } else {
      res.status(200).json({
        status: true,
        message: 'School-wise session count with monthly and weekly breakdown fetched successfully.',
        data: Object.values(result),
        totalSessionsConducted: totalRecords,
        pagination: {
          currentPage: pageNum,
          pageSize: limit,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords,
        },
      });
    }
    
    
    

    // Prepare the response
    
  } catch (error) {
    console.error('Error fetching school-wise records:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch school-wise records.',
      error: error.message,
    });
  }
};


function processDataForSchool(data) {
  let rows = [];
  
  data.forEach(school => {
      // Add school level row
      rows.push([school.schoolName, school.sessionCount, school.totalSessions]);

      school.years.forEach(year => {
          // Add year level row
          rows.push([`Year: ${year.year}`, year.sessionCount, year.totalSessions]);

          year.months.forEach(month => {
              // Add month level row
              rows.push([`Month: ${month.monthName}`, month.sessionCount, month.totalSessions]);

              month.weeks.forEach(week => {
                  // Add week level row
                  rows.push([`Week: ${week.week || 'N/A'}`, week.sessionCount, week.totalSessions]);
              });
          });
      });
  });

  return rows;
}

const yearWiseFinalSessionCount = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      date,
      schoolName,
      trainingType,
      day,
      week,
      month,
      financialYear,
      slotType,
      rtoFilter,
      rtoSubCategory,
      fromDate,
      toDate
    } = req.body;

    const pageNum = parseInt(page, 10) || 1;
    const limit = parseInt(pageSize, 10) || 50;
    const offset = (pageNum - 1) * limit;

    const filters = [];
    const params = [];

    filters.push("bf.training_status = ?");
    params.push("Attended");

    if (date) {
      filters.push("DATE(bf.tempdate) = ?");
      params.push(date);
    }
    if (schoolName) {
      filters.push("sri.institution_name LIKE ?");
      params.push(`%${schoolName}%`);
    }
    if (day) {
      filters.push("DAYOFWEEK(bf.tempdate) = ?");
      params.push(day);
    }
    if (week) {
      filters.push("WEEK(bf.tempdate) = ?");
      params.push(week);
    }
    if (month) {
      filters.push("MONTH(bf.tempdate) = ?");
      params.push(month);
    }
    if (financialYear) {
      const startDate = `${financialYear}-04-01`;
      const endDate = `${parseInt(financialYear, 10) + 1}-03-31`;
      filters.push("DATE(bf.tempdate) BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }
    if (slotType) {
      filters.push("ss.slot_type = ?");
      params.push(slotType);
    }
    if (rtoFilter) {
      filters.push("bf.rto_category = ?");
      params.push(rtoFilter);
    }
    if (rtoSubCategory) {
      filters.push("bf.rto_subcategory = ?");
      params.push(rtoSubCategory);
    }
    if (fromDate) {
      filters.push("bf.tempdate >= ?");
      params.push(fromDate);
    }
    if (toDate) {
      filters.push("bf.tempdate <= ?");
      params.push(toDate);
    }
    if (trainingType) {
      filters.push(`
        CASE 
          WHEN bf.category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = ?`);
      params.push(trainingType);
    }

    const filterCondition = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const query = `
      SELECT
  CASE
    WHEN bf.category IN (
      'RTO – Learner Driving License Holder Training',
      'RTO – Suspended Driving License Holders Training',
      'RTO – Training for School Bus Driver'
    ) THEN bf.category
    WHEN bf.category IN (
      'School Students Training – Group',
      'College/Organization Training – Group'
    ) THEN COALESCE(sri.institution_name, 'Unknown Institution')
    ELSE 'Unknown Category'
  END AS rowLabel,
  bf.category AS category,
  YEAR(bf.tempdate) AS year,
  MONTHNAME(bf.tempdate) AS month,
  WEEK(bf.tempdate) AS week,
  COUNT(DISTINCT bf.id) AS totalNoOfStudent,
  COUNT(DISTINCT bf.sessionSlotId) AS totalNoSessions
FROM BookingForms bf
LEFT JOIN slotregisterinfos sri ON bf.sessionSlotId = sri.sessionSlotId
LEFT JOIN Sessionslots ss ON bf.sessionSlotId = ss.id
 ${filterCondition}
 GROUP BY rowLabel, category, year, MONTH(bf.tempdate), WEEK(bf.tempdate)
ORDER BY rowLabel, year DESC, MONTH(bf.tempdate) DESC, WEEK(bf.tempdate) DESC;

    `;



params.push(limit, offset);
const [records] = await dbObj.query(query, params);

// Grouping data by rowLabel, then by year, month, and week
const groupedData = records.reduce((acc, record) => {
  const { rowLabel, category, year, month, week, totalNoOfStudent, totalNoSessions } = record;

  if (!acc[rowLabel]) {
    acc[rowLabel] = { rowLabel, category, sessionCount: 0, totalNoOfStudent: 0, years: [] };
  }

  const categoryData = acc[rowLabel];
  categoryData.sessionCount += totalNoSessions;
  categoryData.totalNoOfStudent += totalNoOfStudent;

  let yearData = categoryData.years.find((y) => y.year === year);
  if (!yearData) {
    yearData = { year, totalNoOfStudent: 0, totalNoSessions: 0, months: [] };
    categoryData.years.push(yearData);
  }

  let monthData = yearData.months.find((m) => m.month === month);
  if (!monthData) {
    monthData = { month, totalNoOfStudent: 0, totalNoSessions: 0, weeks: [] };
    yearData.months.push(monthData);
  }

  monthData.totalNoOfStudent += totalNoOfStudent;
  monthData.totalNoSessions += totalNoSessions;

  // Grouping by week inside the month
  let weekData = monthData.weeks.find((w) => w.week === week);
  if (!weekData) {
    weekData = { week, totalNoOfStudent, totalNoSessions };
    monthData.weeks.push(weekData);
  } else {
    weekData.totalNoOfStudent += totalNoOfStudent;
    weekData.totalNoSessions += totalNoSessions;
  }

  // Ensure totalNoOfStudent is correctly propagated up to year
  yearData.totalNoOfStudent += totalNoOfStudent;
  yearData.totalNoSessions += totalNoSessions;

  return acc;
}, {});

   // Calculate consolidated totals
   const consolidatedTotals = {
    totalNoOfStudent: records.reduce((sum, record) => sum + record.totalNoOfStudent, 0),
    totalNoSessions: records.reduce((sum, record) => sum + record.totalNoSessions, 0),
  };
// Instead of Object.values(groupedData), you can return all the grouped rows here.
const result = Object.values(groupedData);

    res.status(200).json({
      status: true,
      message: "Grouped session count fetched successfully.",
      data: result,
      totalSessionConducted:consolidatedTotals,
      pagination: {
        currentPage: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(records.length / limit),
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error("Error fetching grouped records:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch grouped records.",
      error: error.message,
    });
  }
};




module.exports = {yearWiseFinalSessionCount,schoolWiseSessionsConducted,trainerWiseSessionsConducted, getInstituteNCategoryList,trainingTypeWiseCount, trainingTypeWiseCountByCategory,trainingTypeWiseCountByYear,trainingTypeWiseCountByMonth,trainingTypeWiseCountByYearAll,trainingTypeWiseCountByYearAllAdult,trainingTypeWiseCountByYearAllSchool,trainingTypeWiseCountRTO,trainingYearWiseCount,totalSessionsConducted};
