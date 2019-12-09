const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');
const User = require('../models/User');

const TEMP_USERS = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'test@test.com',
    password: '1234',
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({users: TEMP_USERS});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  let existingUser;

  if (!errors.isEmpty()) {
    // console.log(errors);
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }

  const { name, email, password, places } = req.body;

  try {
    existingUser = await User.findOne({email});
  } catch (err) {
    const error = new HttpError('Registration failed, please try again', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User already registerd. Please login', 422);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password,
    places,
    image: 'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=2ahUKEwjih7-O-qfmAhWTGjQIHUlhDecQjRx6BAgBEAQ&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FFile%3APlaceholder_no_text.svg&psig=AOvVaw10W2erY6loxiwZOm8ta6OP&ust=1575959769720182',
  });

  try {
    await newUser.save()
  } catch (err) {
    const error = new HttpError('Registration failed. Please try again', 500);
    return next(error);
  }

  res.status(201).json({user: newUser.toObject({getters: true})});
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const user = TEMP_USERS.find(u => u.email === email);

  if (!user || user.password !== password) {
    throw new HttpError('Could not find user. Invalid email and/or password', 401);
  }

  res.status(200).json({message: 'Logged In!'});
};

module.exports = {
  getUsers,
  signup,
  login,
};
