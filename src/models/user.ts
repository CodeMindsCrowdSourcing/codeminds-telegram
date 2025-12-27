import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  bots: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  balance: number;
  discount: number;
}

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  bots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TelegramBot'
    }
  ],
  balance: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
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

// Update the updatedAt field before saving
userSchema.pre('save', function (this: IUser, next: () => void) {
  this.updatedAt = new Date();
  next();
});

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
