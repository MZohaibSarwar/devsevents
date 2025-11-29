import {NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const contentType = req.headers.get('content-type');

        // Handle JSON requests (from frontend form)
        if (contentType?.includes('application/json')) {
            const body = await req.json();

            // Validate required fields
            if (!body.title || !body.description || !body.image) {
                return NextResponse.json(
                    { error: 'Missing required fields: title, description, image' },
                    { status: 400 }
                );
            }

            try {
                const createdEvent = await Event.create(body);
                return NextResponse.json(
                    { message: 'Event created successfully', event: createdEvent },
                    { status: 201 }
                );
            } catch (error) {
                if (error instanceof Error) {
                    // Duplicate slug error
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

        // Handle FormData requests (file uploads with Cloudinary)
        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data format', error: e}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}