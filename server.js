const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const HttpError = require('./models/HttpError.js');

require('dotenv').config();
const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

const placesRoutes = require('./routes/placesRoutes');
const usersRoutes = require('./routes/usersRoutes');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/v1/places', placesRoutes);
app.use('/api/v1/users', usersRoutes);

app.use((req, res, next) => {
  // const error = new HttpError('Could not find this route', 404);
  const error = new Error('Could not find this route.')
  throw error;
});

// Optional Fourth Argument In Callback Makes This An Error Handler Middleware
app.use((error, req, res, next) => {
  // If file was sent on request error, remove the file from disk storage
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

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
