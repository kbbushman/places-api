const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');
const User = require('../models/User');

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Could not find users. Please try again', 500);
    return next(error);
  }

  res.status(200).json({users: users.map(user => user.toObject({getters: true}))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  let existingUser;

  if (!errors.isEmpty()) {
    // console.log(errors);
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }

  const { name, email, password } = req.body;

  try {
    existingUser = await User.findOne({email});
  } catch (err) {
    const error = new HttpError('Registration failed, please try again', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User already registered. Please login', 422);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password,
    places: [],
    image: 'https://www.bsn.eu/wp-content/uploads/2016/12/user-icon-image-placeholder-300-grey.jpg',
  });

  try {
    await newUser.save()
  } catch (err) {
    const error = new HttpError('Registration failed. Please try again', 500);
    return next(error);
  }

  res.status(201).json({user: newUser.toObject({getters: true})});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({email});
  } catch (err) {
    const error = new HttpError('Login failed, please try again', 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid email and/or password. Please try again', 401);
    return next(error);
  }

  res.status(200).json({
    message: 'Logged In!',
    user: existingUser.toObject({getters: true})
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
