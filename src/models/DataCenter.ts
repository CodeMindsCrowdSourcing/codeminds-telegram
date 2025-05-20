import { Schema, model, models } from 'mongoose';

const DataCenterSchema = new Schema({
  city: { type: String, required: true },
  country: { type: String },
  color: { type: String },
  ip: { type: String }, // IP address for ping
  host: { type: String }, // Hostname for ping
  createdAt: { type: Date, default: Date.now }
});

const DataCenter = models.DataCenter || model('DataCenter', DataCenterSchema);

export default DataCenter;
