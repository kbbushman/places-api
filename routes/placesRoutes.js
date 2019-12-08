const express = require('express');
const { check } = require('express-validator');
const placesController = require('../controllers/placesController');
const router = express.Router();

// PATH = /api/v1/places

router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({min: 5}),
    check('address').not().isEmpty()
  ],
  placesController.createPlace
);

router.patch('/:pid', placesController.updatePlace);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
