const dbObj = require('../config/dbConfig');  // Import the MySQL pool

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

    res.status(200).json({
      status: true,
      message: `Training summary fetched successfully${category ? ` for category '${category}'` : ''}.`,
      data: result
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

    const [result] = await dbObj.query(query, category ? [year, category] : [year]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the year: ${year}${category ? ' and category: ' + category : ''}`,
      });
    }

    res.status(200).json({
      status: true,
      message: `Training summary for the year '${year}'${category ? ' and category: ' + category : ''} fetched successfully.`,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data for the year.',
      error: error.message
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

    const [result] = await dbObj.query(query, category ? [year, month, category] : [year, month]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No training summary found for the year: ${year} and month: ${month}${category ? ' and category: ' + category : ''}`,
      });
    }

    res.status(200).json({
      status: true,
      message: `Training summary for the year '${year}' and month '${month}'${category ? ' and category: ' + category : ''} fetched successfully.`,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data for the month.',
      error: error.message
    });
  }
};


// const trainingTypeWiseCountByYearAll2 = async (req, res) => {
//   try {
//     const { year, category } = req.body; // Required: year, optional: category

//     if (!year) {
//       return res.status(400).json({
//         status: false,
//         message: 'Year parameter is required.',
//       });
//     }

//     const monthNames = [
//       "January", "February", "March", "April", "May", "June", 
//       "July", "August", "September", "October", "November", "December"
//     ];

//     let query = `
//       SELECT 
//         MONTH(createdAt) AS MonthNumber,
//         COUNT(DISTINCT sessionSlotId) AS NoOfSessions,  -- Count of distinct sessions
//         COUNT(DISTINCT id) AS TotalPeopleAttended,  -- Count of distinct people
//         CASE 
//           WHEN category = 'School Students Training – Group' THEN 'School'
//           ELSE 'Adult'
//         END AS TrainingType
//       FROM bookingforms
//       WHERE training_status = 'Attended' AND YEAR(createdAt) = ?
//     `;

//     if (category && ['School', 'Adult'].includes(category)) {
//       query += ` AND CASE 
//                     WHEN category = 'School Students Training – Group' THEN 'School'
//                     ELSE 'Adult'
//                   END = ?`;
//     }

//     query += ` GROUP BY MonthNumber, TrainingType;`;

//     const [result] = await dbObj.query(query, category ? [year, category] : [year]);

//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: `No training summary found for the year: ${year}${category ? ' and category: ' + category : ''}`,
//       });
//     }

//     const resultWithMonthNames = result.map(item => ({
//       ...item,
//       MonthName: monthNames[item.MonthNumber - 1]
//     }));

//     res.status(200).json({
//       status: true,
//       message: `Training summary for the year '${year}'${category ? ' and category: ' + category : ''} fetched successfully.`,
//       data: resultWithMonthNames
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: 'Failed to fetch training summary data for the year.',
//       error: error.message
//     });
//   }
// };

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

const trainingTypeWiseCountByYearAll = async (req, res) => {
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

    // Queries with dynamic filters
    const yearlyStatsQuery = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
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
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY MonthNumber, TrainingType;
    `;

    const weeklyStatsQuery = `
      SELECT 
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
      GROUP BY WeekNumber, MonthNumber, TrainingType;
    `;

    const response = [];

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, yearParams);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, yearParams);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, yearParams);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
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

    // Queries with dynamic filters for Adult only
    const yearlyStatsQuery = `
      SELECT 
        'Adult' AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY TrainingType;
    `;

    const monthlyStatsQuery = `
      SELECT 
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'Adult' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY MonthNumber, TrainingType;
    `;

    const weeklyStatsQuery = `
      SELECT 
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'Adult' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY WeekNumber, MonthNumber, TrainingType;
    `;

    const response = [];

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, yearParams);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, yearParams);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, yearParams);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
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
    if (trainingType) {
      filters.push(`
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END = 'School'
      `);
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

    // Queries with dynamic filters for School only
    const yearlyStatsQuery = `
      SELECT 
        'School' AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY TrainingType;
    `;

    const monthlyStatsQuery = `
      SELECT 
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'School' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY MonthNumber, TrainingType;
    `;

    const weeklyStatsQuery = `
      SELECT 
        WEEK(createdAt, 1) AS WeekNumber,
        MONTH(createdAt) AS MonthNumber,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended,
        'School' AS TrainingType
      FROM bookingforms
      WHERE training_status = 'Attended' ${filterCondition}
      GROUP BY WeekNumber, MonthNumber, TrainingType;
    `;

    const response = [];

    // Determine which years to process
    const yearsToProcess = year ? [year] : Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    for (const processingYear of yearsToProcess) {
      const yearParams = year ? params : [processingYear, ...params];

      // Fetch data for the current year
      const [yearlyStats] = await dbObj.query(yearlyStatsQuery, yearParams);
      const [monthlyStats] = await dbObj.query(monthlyStatsQuery, yearParams);
      const [weeklyStats] = await dbObj.query(weeklyStatsQuery, yearParams);

      // If there's data for the year, process and add to response
      if (yearlyStats.length > 0) {
        const monthsWithWeeks = monthlyStats.map(month => {
          const weeks = weeklyStats
            .filter(week => week.MonthNumber === month.MonthNumber && week.TrainingType === month.TrainingType)
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

const trainingTypeWiseCountByYearAllO = async (req, res) => {
  try {
    const { year } = req.body; // Required: year

    if (!year) {
      return res.status(400).json({
        status: false,
        message: 'Year parameter is required.',
      });
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Query for yearly stats
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

    const [yearlyStats] = await dbObj.query(yearlyStatsQuery, [year]);
    const [monthlyStats] = await dbObj.query(monthlyStatsQuery, [year]);

    // Format the JSON response
    const response = [
      {
        [year]: {
          stats: yearlyStats,
          months: monthlyStats.map(item => ({
            ...item,
            MonthName: monthNames[item.MonthNumber - 1],
          }))
        }
      }
    ];

    res.status(200).json({
      status: true,
      message: `Training summary for the year '${year}' fetched successfully.`,
      data: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch training summary data for the year.',
      error: error.message
    });
  }
};


module.exports = { trainingTypeWiseCount, trainingTypeWiseCountByCategory,trainingTypeWiseCountByYear,trainingTypeWiseCountByMonth,trainingTypeWiseCountByYearAll,trainingTypeWiseCountByYearAllAdult,trainingTypeWiseCountByYearAllSchool};
