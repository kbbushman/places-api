const uuid = require('uuid/v4');
const HttpError = require('../models/HttpError');

let TEMP_PLACES = [
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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const selectedPlace = TEMP_PLACES.find(place => place.id === placeId);

  if (!selectedPlace) {
    throw new HttpError('Could not find a place by the provided id.', 404);
  }

  res.json({status: 200, data: selectedPlace});
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const selectedPlaces = TEMP_PLACES.filter(place => place.creator === userId);

  if (!selectedPlaces || selectedPlaces.length === 0) {
    return next(new HttpError('Could not find a places by the provided user id.', 404));
  }

  res.json({status:200, data: selectedPlaces});
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const newPlace = {
    title,
    description,
    address,
    creator,
    location: coordinates,
    id: uuid(),
  };

  TEMP_PLACES.push(newPlace);

  res.status(201).json({place: newPlace});
};

const updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = {...TEMP_PLACES.find(place => place.id === placeId)};
  const placeIndex = TEMP_PLACES.findIndex(place => place.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  TEMP_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({place: updatedPlace});
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  TEMP_PLACES = TEMP_PLACES.filter(place => place.id !== placeId);

  res.status(200).json({message: 'Place Deleted'});
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
