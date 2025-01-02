const News = require('../models/News');
const apiResponse = require('../helper/apiResponse');

// Add News with img and title
exports.addNews = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const News1 = await News.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'News added successfully', News1);
  } catch (error) {
    console.error('Add News failed', error);
    return apiResponse.ErrorResponse(res, 'Add News failed');
  }
};

// Update News with img and title
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the News record by its ID
    const NewsRecord = await News.findByPk(id);
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      NewsRecord.img = img; // Use the correct variable here
    }
    NewsRecord.title = title; // Update the title

    // Save the updated record
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News updated successfully', NewsRecord);
  } catch (error) {
    console.error('Update News failed', error);
    return apiResponse.ErrorResponse(res, 'Update News failed');
  }
};


// Get all News entries
exports.getNews = async (req, res) => {
  try {
    // Determine if this is the find-News route
    const isFindRoute = req.path === '/find-News';

    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }

    // Fetch the News records with the query conditions
    const objectives = await News.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'News retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get News failed', error);
    return apiResponse.ErrorResponse(res, 'Get News failed');
  }
};

exports.getActiveNews = async (req, res) => {
  try {
    // Fetch only active News records where isDelete is false
    const activeNewsRecords = await News.findAll({
      where: {
        isDelete: false,
        isActive: true,
      },
    });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const activeNewsWithBaseUrl = activeNewsRecords.map(news => ({
      ...news.toJSON(),
      img: news.img ? baseUrl + news.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(
      res,
      'Active News records retrieved successfully',
      activeNewsWithBaseUrl
    );
  } catch (error) {
    console.error('Get Active News failed', error);
    return apiResponse.ErrorResponse(res, 'Get Active News failed');
  }
};

// Toggle isActive status of News
exports.toggleNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const NewsRecord = await News.findByPk(id);

    // Check if the record exists
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Toggle the active status
    NewsRecord.isActive = !NewsRecord.isActive;
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News status updated successfully', NewsRecord);
  } catch (error) {
    console.error('Toggle News status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle News status failed');
  }
};


// Toggle isDelete status of News
exports.toggleNewsDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const NewsRecord = await News.findByPk(id);

    // Check if the record exists
    if (!NewsRecord) {
      return apiResponse.notFoundResponse(res, 'News not found');
    }

    // Toggle the delete status
    NewsRecord.isDelete = !NewsRecord.isDelete;
    await NewsRecord.save();

    return apiResponse.successResponseWithData(res, 'News delete status updated successfully', NewsRecord);
  } catch (error) {
    console.error('Toggle News delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle News delete status failed');
  }
};


exports.renderNewsDetailPage = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the news item by ID
    const news = await News.findOne({
      where: { id, isDelete: false, isActive: true },
    });

    if (!news) {
      return res.status(404).send('News not found');
    }

    // Construct the base URL
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const imageUrl = news.img
      ? `${baseUrl}${news.img.replace(/\\/g, '/')}?w=800&h=600&fit=crop&quality=80&format=webp`
      : null;

    // Serve an HTML page with Open Graph meta tags
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="og:title" content="${news.title}" />
        <meta property="og:description" content="${news.description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${baseUrl}news/${id}" />
        <meta property="og:type" content="article" />
        <title>${news.title}</title>
      </head>
      <body>
        <h1>${news.title}</h1>
        <p>${news.description}</p>
        <img src="${imageUrl}" alt="${news.title}" />
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching news for Open Graph', error);
    res.status(500).send('Internal Server Error');
  }
};




// exports.renderNewsDetailPage = async (req, res) => {
//   try {
//     const id = req.params.id;  // Extract the ID from the URL

//     // Redirect to the new URL
//     const newUrl = `https://positivemetering.in`;
//     res.redirect(newUrl);
//   } catch (error) {
//     console.error('Error redirecting to the news detail page', error);
//     res.status(500).send('Internal Server Error');
//   }
// };

exports.getNewsArticleForOpenGraph = async (req, res) => {
  try {
    const { id } = req.params;
    const newsArticle = await News.findByPk(id);

    if (!newsArticle || newsArticle.isDeleted) {
      return apiResponse.notFoundResponse(res, "News article not found");
    }

    // const baseUrl = `${req.protocol}://${req.get('host')}/`;
    // const imgUrl = newsArticle.img ? baseUrl + newsArticle.img.replace(/\\/g, '/') : null;
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const imageUrl = newsArticle.img ? baseUrl + newsArticle.img.replace(/\\/g, '/') : null;
    res.json({
      title: newsArticle.title,
      description: newsArticle.summary,
      image: imageUrl,
      url: `${baseUrl}/news/${id}`,
    });
  } catch (error) {
    console.error("Get news article for Open Graph failed", error);
    apiResponse.ErrorResponse(res, "Internal Server Error");
  }
};

exports.getNewsArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsArticle = await News.findByPk(id);

    if (!newsArticle || newsArticle.isDeleted) {
      return apiResponse.notFoundResponse(res, "News article not found");
    }

    res.status(200).json(newsArticle);
  } catch (error) {
    console.error("Get news article by ID failed", error);
    apiResponse.ErrorResponse(res, "Internal Server Error");
  }
};
