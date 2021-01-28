// User model goes here
/*create the User model with mongoose, the routes, and the views.

Remember that you should to handle validation errors when a user signs up:

The fields can't be empty.
The username can't be repeated. */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    required: true
  },
  passwordHashAndSalt: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
