const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../helper/apiResponse');

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return apiResponse.notFoundResponse(res, 'User not found');
    }

    if (user.password !== password) {
      return apiResponse.unauthorizedResponse(res, 'Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return apiResponse.successResponseWithData(res, 'Login successful', { token });
  } catch (error) {
    console.log("Login failed", error);
    return apiResponse.ErrorResponse(res, 'Login failed');
  }
};

module.exports = { loginUser };
