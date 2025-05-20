import mongoose from 'mongoose';

const telegramCheckLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  cleanPhone: {
    type: String,
    required: true
  },
  clientConnected: {
    type: Boolean,
    required: true
  },
  clientAuthorized: {
    type: Boolean,
    required: true
  },
  telegramResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  isFound: {
    type: Boolean,
    required: true
  },
  telegramUser: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const TelegramCheckLogModel = mongoose.models.TelegramCheckLog || mongoose.model('TelegramCheckLog', telegramCheckLogSchema); 