const express = require('express');
const HttpError = require('../models/httpError');
const router = express.Router();

const TEMP_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.8971516,
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1',
  },
];

router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;
  const selectedPlace = TEMP_PLACES.find(place => place.id === placeId);

  if (!selectedPlace) {
    throw new HttpError('Could not find a place by the provided id.', 404);
  }

  res.json({status: 200, data: selectedPlace});
});

router.get('/users/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const selectedPlace = TEMP_PLACES.find(place => place.creator === userId);

  if (!selectedPlace) {
    return next(new HttpError('Could not find a place by the provided user id.', 404));
  }

  res.json({status:200, data: selectedPlace})
});

module.exports = router;
