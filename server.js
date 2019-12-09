const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HttpError = require('./models/HttpError');

require('dotenv').config();
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

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
  .then(() => {
    app.listen(process.env.PORT, () => console.log(`Server running at http://localhost:${process.env.PORT}`));
  })
  .catch((err) => console.log(err));
