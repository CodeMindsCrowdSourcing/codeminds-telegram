import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  console.log('Attempting to connect to MongoDB...');

  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new database connection...');
    const opts = {
      bufferCommands: false
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return cached;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('Database connection established');
  } catch (e) {
    console.error('Error connecting to MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
