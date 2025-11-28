import mongoose, { Connection } from 'mongoose';

// Interface to maintain connection state in the global scope
interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Declare global type to prevent TypeScript errors with global variable
declare global {
  var mongooseCache: CachedConnection | undefined;
}

// Initialize or use existing cached connection
const cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

// Store cache in global scope for reuse across hot reloads in development
global.mongooseCache = cached;

/**
 * Connect to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections during development
 * @returns Promise<Connection> - The Mongoose connection object
 */
async function connectToDatabase(): Promise<Connection> {
  // Return cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending promise if connection is already in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Validate required environment variable
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create new connection promise
  cached.promise = mongoose
    .connect(mongodbUri, {
      // Connection options for optimal performance and stability
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      // Cache the connection after successful connection
      cached.conn = mongooseInstance.connection;
      return cached.conn;
    })
    .catch((error) => {
      // Clear promise on error to allow retry
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

export default connectToDatabase;
