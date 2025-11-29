import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug (remove any potential malicious input)
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query events by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle events not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response with events data
    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching events by slug:', error);
    }

    // Handle specific error types
    if (error instanceof Error) {
      // Handle database connection errors
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { message: 'Database configuration error' },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: 'Failed to fetch events', error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[slug]
 * Update an existing event by MongoDB ID or slug
 */
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug/ID parameter' },
        { status: 400 }
      );
    }

    const contentType = request.headers.get('content-type');
    let updateData: Record<string, unknown> = {};

    // Handle FormData requests (with file upload)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();

      const stringFields = [
        'title',
        'description',
        'overview',
        'venue',
        'location',
        'date',
        'time',
        'mode',
        'audience',
        'organizer',
      ];

      stringFields.forEach((field) => {
        const value = formData.get(field);
        if (value) updateData[field] = value;
      });

      // Handle file upload if provided
      const file = formData.get('image');
      if (file instanceof File) {
        // In production, upload to Cloudinary here
        // For now, we'll skip image update
        console.log('Image file received but not processed in this route');
      }

      // Parse JSON fields
      const agenda = formData.get('agenda');
      if (agenda) updateData.agenda = JSON.parse(agenda as string);

      const tags = formData.get('tags');
      if (tags) updateData.tags = JSON.parse(tags as string);
    } else {
      // Handle JSON requests
      updateData = await request.json();
    }

    // Try to update by MongoDB ID first (if slug is a valid ObjectId)
    if (Types.ObjectId.isValid(slug)) {
      try {
        const updatedEvent = await Event.findByIdAndUpdate(slug, updateData, {
          new: true,
          runValidators: true,
        });

        if (updatedEvent) {
          return NextResponse.json(
            { message: 'Event updated successfully', event: updatedEvent },
            { status: 200 }
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('E11000')) {
            return NextResponse.json(
              { error: 'An event with this title already exists' },
              { status: 409 }
            );
          }
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }
    }

    // Fall back to updating by slug
    try {
      const updatedEvent = await Event.findOneAndUpdate(
        { slug: slug.toLowerCase() },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedEvent) {
        return NextResponse.json(
          { message: `Event with ID/slug '${slug}' not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Event updated successfully', event: updatedEvent },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('E11000')) {
          return NextResponse.json(
            { error: 'An event with this title already exists' },
            { status: 409 }
          );
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while updating the event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[slug]
 * Delete an event by MongoDB ID or slug
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug/ID parameter' },
        { status: 400 }
      );
    }

    // Try to delete by MongoDB ID first (if slug is a valid ObjectId)
    if (Types.ObjectId.isValid(slug)) {
      const deletedEvent = await Event.findByIdAndDelete(slug);
      if (deletedEvent) {
        return NextResponse.json(
          { message: 'Event deleted successfully', event: deletedEvent },
          { status: 200 }
        );
      }
    }

    // Fall back to deleting by slug
    const deletedEvent = await Event.findOneAndDelete({ slug: slug.toLowerCase() });

    if (!deletedEvent) {
      return NextResponse.json(
        { message: `Event with ID/slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event deleted successfully', event: deletedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while deleting the event' },
      { status: 500 }
    );
  }
}