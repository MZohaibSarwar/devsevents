import mongoose, { Document, Schema } from 'mongoose';

// Interface extending Document for type safety
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition with validation rules
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid image URL'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Event mode is required'],
    },
    audience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must have at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must have at least one item',
      },
    },
  },
  { timestamps: true }
);

// Auto-generate URL-friendly slug from title and normalize date/time
// Pre-save hook: generate slug, normalize date/time, and validate values
eventSchema.pre('save', function (this: IEvent) {
  // Generate slug only if title is new or has changed
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(this.date)) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      // Throwing an error causes Mongoose to abort the save
      throw new Error('Invalid date format. Expected YYYY-MM-DD or valid date string');
    }
    this.date = parsedDate.toISOString().split('T')[0];
  }

  // Normalize time format (HH:MM or HH:MM:SS)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(this.time.trim())) {
    throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
  }
});

// Create or retrieve the Event model with type safety
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
