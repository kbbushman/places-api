const express = require('express');
const placesController = require('../controllers/placesController');
const router = express.Router();

router.get('/:pid', placesController.getPlaceById);

router.get('/users/:uid', placesController.getPlaceByUserId);

module.exports = router;
