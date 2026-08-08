const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  // Store plain password here — it gets hashed when the real User is created
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // auto-delete after 24 hours
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);