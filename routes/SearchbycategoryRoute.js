const express = require('express');
const { searchBookingFormByCategory } = require('../controllers/SearchbycategoryController');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/search', searchBookingFormByCategory);

module.exports = router;