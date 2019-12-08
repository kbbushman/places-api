const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');

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

const signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const { name, email, password } = req.body;

  const existingUser = TEMP_USERS.find(user => user.email === email);

  if (existingUser) {
    throw new HttpError('Could not create user, email already registered', 422);
  }

  const newUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  TEMP_USERS.push(newUser);

  res.status(201).json({user: newUser});
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
