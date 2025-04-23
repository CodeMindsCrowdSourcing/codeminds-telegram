import mongoose, { Document } from 'mongoose';

interface ITelegramBot extends Document {
  name: string;
  token: string;
  isRunning: boolean;
  owner: mongoose.Schema.Types.ObjectId;
  buttonText: string;
  infoText: string;
  authorId: string;
  linkImage: string;
  buttonPrivateMessage: string;
  messagePrivateMessage: string;
  messageOnClick: string;
  users: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const telegramBotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  isRunning: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buttonText: {
    type: String,
    default: 'להזמנות לחצו כאן',
  },
  infoText: {
    type: String,
    default: 'להזמנות לחצו כאן',
  },
  authorId: {
    type: String,
    default: '7358531844',
  },
  linkImage: {
    type: String,
    default: '/images/strange.jpg',
  },
  buttonPrivateMessage: {
    type: String,
    default: '👤 Open profile',
  },
  messagePrivateMessage: {
    type: String,
    default: 'Thank you for your interest! Click the button below to open the author\'s profile:',
  },
  messageOnClick: {
    type: String,
    default: 'Thank you for clicking! Processing your request...',
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TelegramUser'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
telegramBotSchema.pre('save', function(this: ITelegramBot, next: () => void) {
  this.updatedAt = new Date();
  next();
});

export const TelegramBotModel = mongoose.models.TelegramBot || mongoose.model<ITelegramBot>('TelegramBot', telegramBotSchema); 