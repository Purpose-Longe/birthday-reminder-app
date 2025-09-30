const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true, trim: true },
  dob: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create unique index on email to ensure uniqueness at DB level
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
