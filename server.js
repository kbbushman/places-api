const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/HttpError');

const app = express();

app.use(bodyParser.json());

const placesRoutes = require('./routes/placesRoutes');
const usersRoutes = require('./routes/usersRoutes');

app.use('/api/v1/places', placesRoutes);
app.use('/api/v1/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

// Optional Fourth Argument In Callback Makes This An Error Handler Middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({message: error.message || 'An unknown error occurred!'});
});

app.listen(5000);
