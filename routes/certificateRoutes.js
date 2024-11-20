// routes/certificateRoutes.js
const express = require('express');
const { uploadCertificate } = require('../controllers/certificateController');

const router = express.Router();

// POST route to upload certificates and send email
router.post('/upload-certificate', uploadCertificate);

module.exports = router;
