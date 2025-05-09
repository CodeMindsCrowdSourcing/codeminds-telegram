import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramGroup extends Document {
  botId: string;
  groupId: number;
  groupName: string;
  messages: {
    enabled: boolean;
    delay: number; // в секундах
    text: string;
    image?: string;
    video?: string;
    lastSentAt?: Date;
    buttonText?: string;
    buttonUrl?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TelegramGroupSchema = new Schema<ITelegramGroup>({
  botId: { type: String, required: true },
  groupId: { type: Number, required: true },
  groupName: { type: String, required: true },
  messages: [
    {
      enabled: { type: Boolean, default: true },
      delay: { type: Number, default: 60 },
      text: { type: String, required: true },
      image: { type: String },
      video: { type: String },
      lastSentAt: { type: Date },
      buttonText: { type: String },
      buttonUrl: { type: String }
    }
  ]
}, { timestamps: true });

export default mongoose.models.TelegramGroup ||
  mongoose.model<ITelegramGroup>('TelegramGroup', TelegramGroupSchema); 