const express = require('express');
const placesController = require('../controllers/placesController');
const router = express.Router();

// PATH = /api/v1/places

router.get('/:pid', placesController.getPlaceById);

router.get('/users/:uid', placesController.getPlaceByUserId);

router.post('/', placesController.createPlace);

router.patch('/:pid', placesController.updatePlace);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
