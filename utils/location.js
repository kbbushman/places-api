const axios = require('axios');
const HttpError = require('../models/HttpError');

require('dotenv').config();

async function getCoordsForAddress(address) {
  // encodeURIComponent returns a URL friendly string
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_PLACES_API_KEY}`);

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError('Could not find a location for the specified address', 422);
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
