import mongoose from 'mongoose';

const customUserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chatId: {
    type: Number,
    required: true,
    unique: true
  },
  username: String,
  firstName: String,
  lastName: String,
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
customUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CustomUserModel = mongoose.models.CustomUser || mongoose.model('CustomUser', customUserSchema); 