const jwt = require('jsonwebtoken');
const HttpError = require('../models/HttpError');

require('dotenv').config();

module.exports = (req, res, next) => {
  let token;

  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    token = req.headers.authorization.split(' ')[1];

    if (!token) {
      throw new Error('Authentication failed. Please login and try again.')
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = {userId: decodedToken.userId};
    next();
  } catch (err) {
    const error = new HttpError('Authentication is required. Please login and try again', 403);
    return next(error);
  }

}
