import mongoose from 'mongoose';

const telegramUserSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TelegramBot',
      required: true,
    },
    username: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    languageCode: {
      type: String,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on userId and botId to ensure uniqueness
telegramUserSchema.index({ userId: 1, botId: 1 }, { unique: true });

export const TelegramUserModel =
  mongoose.models.TelegramUser ||
  mongoose.model('TelegramUser', telegramUserSchema);

export type TelegramUser = mongoose.InferSchemaType<typeof telegramUserSchema>; 