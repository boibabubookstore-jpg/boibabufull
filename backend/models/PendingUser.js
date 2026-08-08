const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user'
  },
  verificationToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
}, {
  timestamps: true
});

// Hash password before saving
pendingUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate verification token
pendingUserSchema.methods.generateVerificationToken = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = mongoose.model('PendingUser', pendingUserSchema);