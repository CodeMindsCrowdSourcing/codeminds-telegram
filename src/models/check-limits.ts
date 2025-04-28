import mongoose, { Document } from 'mongoose';

interface ICheckLimits extends Document {
  userId: string;
  dailyChecks: number;
  lastCheckTime: Date;
  lastResetDate: Date;
}

const checkLimitsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  dailyChecks: {
    type: Number,
    default: 0
  },
  lastCheckTime: {
    type: Date,
    default: Date.now
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  }
});

// Reset daily checks if it's a new day
checkLimitsSchema.pre('save', function(this: ICheckLimits, next: () => void) {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyChecks = 0;
    this.lastResetDate = now;
  }
  
  next();
});

export const CheckLimitsModel = mongoose.models.CheckLimits || mongoose.model<ICheckLimits>('CheckLimits', checkLimitsSchema); 