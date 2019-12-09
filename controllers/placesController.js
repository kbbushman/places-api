const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/Place');

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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong while trying to find place', 500);
    return next(error);
  }


  if (!place) {
    const error = new HttpError('Could not find a place by the provided id.', 404);
    return next(error);
  }

  // {getters: true} adds an "id" prop with string value to the object
  res.json({status: 200, place: place.toObject({getters: true})});
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({creator: userId});
  } catch (err) {
    const error = new HttpError('Could not find places. Please try again', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find a places by the provided user id.', 404));
  }

  res.json({status:200, places: places.map(place => place.toObject({getters: true}))});
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (err) {
    return next(err);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    creator,
    location: coordinates,
    image: 'https://www.ggcatering.com/system/uploads/fae/image/asset/2969/City_View_at_Metreon_HERO.jpg',
  });

  try {
    await newPlace.save();
  } catch (err) {
    const error = new HttpError('Create new place failed. Please try again', 500);
    return next(error);
  }

  res.status(201).json({place: newPlace});
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors);
    const error = new HttpError('Invalid inputs passed, please check your data', 422);
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Update place failed. Please try again', 500);
    return next(error);
  }
  
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('Update place failed. Please try again', 500);
    return next(error);
  }

  res.status(200).json({place: place.toObject({getters: true})});
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!TEMP_PLACES.find(place => place.id === placeId)) {
    throw new HttpError('Could not find a place with provided ID', 404);
  }

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
