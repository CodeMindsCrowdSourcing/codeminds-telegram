import mongoose from 'mongoose';

const telegramSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  sessionString: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
telegramSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const TelegramSessionModel = mongoose.models.TelegramSession || mongoose.model('TelegramSession', telegramSessionSchema); 