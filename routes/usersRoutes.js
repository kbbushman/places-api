const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');
const router = express.Router();

// PATH = /api/v1/users

router.get('/', usersController.getUsers);

router.post(
  '/signup', 
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min: 6}),
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
