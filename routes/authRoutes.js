const express = require('express');
const { loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const { validateLogin } = require('../validations/loginvalidation');

const router = express.Router();

router.post('/login', validateLogin, loginUser);

module.exports = router;
