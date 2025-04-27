import mongoose, { Document } from 'mongoose';

interface ICustomUser extends Document {
  userId: mongoose.Types.ObjectId;
  phone: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isFound: boolean;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
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
  isFound: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
  },
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
customUserSchema.pre('save', function(this: ICustomUser, next: () => void) {
  this.updatedAt = new Date();
  next();
});

export const CustomUserModel = mongoose.models.CustomUser || mongoose.model<ICustomUser>('CustomUser', customUserSchema); 