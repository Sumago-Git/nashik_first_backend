const dbObj = require('../config/dbConfig');  // Import the MySQL pool

/**
 * Controller for fetching training summary with pagination
 */
const trainingTypeWiseCount1 = async (req, res) => {
  try {
    const { pageSize = 10, currentPage = 1 } = req.body; // Extract pagination params from body
    const limit = parseInt(pageSize);
    const offset = (parseInt(currentPage) - 1) * limit;

    // Query to get paginated data
    const paginatedQuery = `
      SELECT 
        CASE 
          WHEN category = 'School Students Training – Group' THEN 'School'
          ELSE 'Adult'
        END AS TrainingType,
        COUNT(DISTINCT sessionSlotId) AS NoOfSessions,
        COUNT(DISTINCT id) AS TotalPeopleAttended
      FROM bookingforms
      GROUP BY TrainingType
      LIMIT ? OFFSET ?;
    `;

    // Query to get total items
    const totalCountQuery = `
      SELECT 
        COUNT(DISTINCT TrainingType) AS TotalItems
      FROM (
        SELECT 
          CASE 
            WHEN category = 'School Students Training – Group' THEN 'School'
            ELSE 'Adult'
          END AS TrainingType
        FROM bookingforms
      ) AS SubQuery;
    `;

    // Get the total item count
    const [totalResult] = await dbObj.query(totalCountQuery);

    const totalItems = totalResult[0].TotalItems;
    const totalPages = Math.ceil(totalItems / limit);

    // Get the paginated data
    const [paginatedResult] = await dbObj.query(paginatedQuery, [limit, offset]);

    // Return the result with pagination info
    res.status(200).json({
      data: paginatedResult,
      pagination: {
        currentPage,
        pageSize: limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch training summary data.' });
  }
};

module.exports = { trainingTypeWiseCount1 };
