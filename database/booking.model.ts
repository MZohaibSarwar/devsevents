import mongoose, { Document, Schema, Types } from 'mongoose';
import Event from './event.model';

// Interface extending Document for type safety
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email validation regex pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema definition with validation rules
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
  },
  { timestamps: true }
);

// Add index on eventId for optimized queries
bookingSchema.index({ eventId: 1 });

// Validate that referenced event exists before saving booking
bookingSchema.pre('save', async function () {
  try {
    // Check if eventId references an existing event
    const eventExists = await Event.findById(this.eventId);
    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  } catch (error) {
    throw error;
  }
});

// Create or retrieve the Booking model with type safety
const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
