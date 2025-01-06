const EventGallary = require('../models/EventGallary');
const apiResponse = require('../helper/apiResponse');

// Add EventGallary with img and title
exports.addEventGallary = async (req, res) => {
  try {
    const { title } = req.body;
    const img = req.file ? req.file.path : null;  // Use req.file since uploadSingle is used

    const EventGallary1 = await EventGallary.create({
      img: img,
      title: title,
    });

    return apiResponse.successResponseWithData(res, 'EventGallary added successfully', EventGallary1);
  } catch (error) {
    console.error('Add EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Add EventGallary failed');
  }
};

// Update EventGallary with img and title
exports.updateEventGallary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const img = req.file ? req.file.path : null;

    // Fetch the EventGallary record by its ID
    const EventGallaryRecord = await EventGallary.findByPk(id);
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Only update img if a new file is uploaded
    if (img) {
      EventGallaryRecord.img = img; // Use the correct variable here
    }
    EventGallaryRecord.title = title; // Update the title

    // Save the updated record
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Update EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Update EventGallary failed');
  }
};


// Get all EventGallary entries
exports.getEventGallary = async (req, res) => {
  try {
    // Determine if this is the find-EventGallary route
    const isFindRoute = req.path === '/find-EventGallary';

    // Build the query conditions
    const queryConditions = { isDelete: false };
    if (isFindRoute) {
      queryConditions.isActive = true; // Only include active objectives if this is the find route
    }

    // Fetch the EventGallary records with the query conditions
    const objectives = await EventGallary.findAll({ where: queryConditions });

    // Construct the base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const objectivesWithBaseUrl = objectives.map(objective => ({
      ...objective.toJSON(),
      img: objective.img ? baseUrl + objective.img.replace(/\\/g, '/') : null, // Ensure the image path is formatted correctly
    }));

    return apiResponse.successResponseWithData(res, 'EventGallary retrieved successfully', objectivesWithBaseUrl);
  } catch (error) {
    console.error('Get EventGallary failed', error);
    return apiResponse.ErrorResponse(res, 'Get EventGallary failed');
  }
};


// Toggle isActive status of EventGallary
exports.toggleEventGallaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const EventGallaryRecord = await EventGallary.findByPk(id);

    // Check if the record exists
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Toggle the active status
    EventGallaryRecord.isActive = !EventGallaryRecord.isActive;
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary status updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Toggle EventGallary status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle EventGallary status failed');
  }
};


// Toggle isDelete status of EventGallary
exports.toggleEventGallaryDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const EventGallaryRecord = await EventGallary.findByPk(id);

    // Check if the record exists
    if (!EventGallaryRecord) {
      return apiResponse.notFoundResponse(res, 'EventGallary not found');
    }

    // Toggle the delete status
    EventGallaryRecord.isDelete = !EventGallaryRecord.isDelete;
    await EventGallaryRecord.save();

    return apiResponse.successResponseWithData(res, 'EventGallary delete status updated successfully', EventGallaryRecord);
  } catch (error) {
    console.error('Toggle EventGallary delete status failed', error);
    return apiResponse.ErrorResponse(res, 'Toggle EventGallary delete status failed');
  }
};

// exports.renderEventGallary = async (req, res) => {

//     try {
//       const { id } = req.params;

//       // Fetch the EventGallary item by ID
//       const event = await EventGallary.findOne({
//         where: { id },
//       });

//       if (!event) {
//         return res.status(404).send('Event not found');
//       }

//       // Construct the base URL
//       const baseUrl = `${req.protocol}://${req.get('host')}/`;
//       const imageUrl = event.img
//         ? `${baseUrl}${event.img.replace(/\\/g, '/')}` // Ensure correct image path
//         : null;

//       // Serve an HTML page with Open Graph meta tags
//       res.send(`
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <meta property="og:title" content="${event.title}" />
//           <meta property="og:description" content="${event.description}" />
//           <meta property="og:image" content="${imageUrl}" />
//           <meta property="og:url" content="${baseUrl}EventGallary/${id}" />
//           <meta property="og:type" content="article" />
//           <title>${event.title}</title>
//         </head>
//         <body>
//           <h1>${event.title}</h1>
//           <p>${event.description}</p>
//           <img src="${imageUrl}" alt="${event.title}" />
//         </body>
//         </html>
//       `);
//     } catch (error) {
//       console.error('Error fetching event for Open Graph', error);
//       res.status(500).send('Internal Server Error');
//     }
//   };

exports.renderEventGallary = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the EventGallary item by ID
    const event = await EventGallary.findOne({
      where: { id },
    });

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Construct the base URL
    const baseUrl = `${req.protocol}://${req.get('host')}/`;
    const imageUrl = event.img
      ? `${baseUrl}${event.img.replace(/\\/g, '/')}` // Ensure correct image path
      : null;

    // Construct WhatsApp sharing URL
    const shareUrl = `$https://api.nashikfirst.com/EventGallary/getEventGallary/${id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Check out this event: ${event.title}\n${event.description}\n${shareUrl}`
    )}`;

    // Serve an HTML page with Open Graph meta tags
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="og:title" content="${event.title}" />
        <meta property="og:description" content="${event.description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${shareUrl}" />
        <meta property="og:type" content="article" />
        <title>${event.title}</title>
      </head>
      <body>
        <!-- Section with Image and Text -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://via.placeholder.com/150" alt="Check out this event" style="display: block; margin: 0 auto; width: 100px; height: auto;" />
          <p style="font-size: 20px; font-weight: bold;">Check out this event:</p>
        </div>

        <h1>${event.title}</h1>
        <p>${event.description}</p>
        ${imageUrl ? `<img src="${imageUrl}" alt="${event.title}" style="max-width: 100%; height: auto;" />` : ''}
        <br />
        <!-- WhatsApp View Button with Image -->
        <a href="${whatsappUrl}" target="_blank" style="display: inline-flex; align-items: center; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 20px; height: 20px; margin-right: 10px;" />
          View on WhatsApp
        </a>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching event for Open Graph', error);
    res.status(500).send('Internal Server Error');
  }
};
