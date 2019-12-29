const fs = require('fs');
const uuid = require('uuid/v4');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const HttpError = require('../models/HttpError');
const getCoordsFromAddress = require('../utils/location');
const Place = require('../models/Place');
const User = require('../models/User');

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
  let userPlaces;
  // let places;

  try {
    userPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError('Could not find places. Please try again', 500);
    return next(error);
  }

  if (!userPlaces || userPlaces.places.length === 0) {
    return next(new HttpError('Could not find a places by the provided user id.', 404));
  }

  res.json({status:200, places: userPlaces.places.map(place => place.toObject({getters: true}))});
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
    image: req.file.path,
    // image: 'https://www.ggcatering.com/system/uploads/fae/image/asset/2969/City_View_at_Metreon_HERO.jpg',
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Create new place failed. Please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user with provided id. Please try again', 404);
    return next(error);
  }

  try {
    // Session will prevent all transactions from succeeding if one fails
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({session: sess});
    user.places.push(newPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
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

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError('Delete place failed. Please try again', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place with provided id. Please try again', 500);
    return next(error);
  }

  const imagePath = place.image;

  try {
    // Session will prevent all transactions from succeeding if one fails
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session: sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Delete place failed. Please try again', 500);
    return next(error);
  }

  // Delete Place Image
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({message: 'Place Deleted'});
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
