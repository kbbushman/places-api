const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/HttpError');
const User = require('../models/User');

require('dotenv').config();

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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Could not create account, please try again.', 500);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path,
    // image: 'https://www.bsn.eu/wp-content/uploads/2016/12/user-icon-image-placeholder-300-grey.jpg',
  });

  try {
    await newUser.save()
  } catch (err) {
    const error = new HttpError('Registration failed. Please try again', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {userId: createdUser.id, email: createdUser.email},
      process.env.JWT_SECRET,
      {expiresIn: '1hr'}
    );
  } catch (err) {
    const error = new HttpError('Registration failed. Please try again', 500);
    return next(error);
  }

  res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
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

  if (!existingUser) {
    const error = new HttpError('Invalid email and/or password. Please try again', 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError('Login failed. Please check your credentials and try again.', 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid email and/or password. Please try again', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email},
      process.env.JWT_SECRET,
      {expiresIn: '1hr'}
    );
  } catch (err) {
    const error = new HttpError('Login failed. Please try again', 500);
    return next(error);
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
