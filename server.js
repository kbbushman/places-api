const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const placesRoutes = require('./routes/placesRoutes');

app.use('/api/v1/places', placesRoutes);

// Optional Fourth Argument In Callback Makes This An Error Handler Middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({message: error.message || 'An unknown error occurred!'});
});

app.listen(5000);
