'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EventForm from '@/components/EventForm';
import DashboardEventCard from '@/components/DashboardEventCard';
import Link from 'next/link';
import { IEvent } from '@/database';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {session.user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-500 hover:underline">
              ← Back to Home
            </Link>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Create Event Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
            <EventForm />
          </section>

          {/* Your Events Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Events</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No events created yet. Create your first event above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event: IEvent) => (
                  <DashboardEventCard
                    key={event._id?.toString()}
                    id={event._id?.toString() || ''}
                    title={event.title}
                    image={event.image}
                    slug={event.slug}
                    location={event.location}
                    date={event.date}
                    time={event.time}
                    description={event.description}
                    overview={event.overview}
                    venue={event.venue}
                    mode={event.mode}
                    audience={event.audience}
                    agenda={event.agenda}
                    organizer={event.organizer}
                    tags={event.tags}
                    onEditSuccess={() => {
                      // Refresh events list
                      const fetchEvents = async () => {
                        const response = await fetch('/api/events');
                        const data = await response.json();
                        setEvents(data.events || []);
                      };
                      fetchEvents();
                    }}
                    onDeleteSuccess={() => {
                      // Refresh events list
                      const fetchEvents = async () => {
                        const response = await fetch('/api/events');
                        const data = await response.json();
                        setEvents(data.events || []);
                      };
                      fetchEvents();
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
