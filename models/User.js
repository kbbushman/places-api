const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  image: {
    type: String,
    required: true,
  },
  places: {
    type: String,
    required: true,
  },
});

// Unique Email Validation
UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', UserSchema);
