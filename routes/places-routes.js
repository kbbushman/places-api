const express = require('express');
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
    const error = new Error('Could not find a place by the provided id.');
    error.code = 404;
    throw error;
  }

  res.json({status: 200, data: selectedPlace});
});

router.get('/users/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const selectedPlace = TEMP_PLACES.find(place => place.creator === userId);

  if (!selectedPlace) {
    const error = new Error('Could not find a place by the provided user id.');
    error.code = 404;
    return next(error);
  }

  res.json({status:200, data: selectedPlace})
});

module.exports = router;
