import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    'use cache';
    cacheLife('hours')
    
    let events: IEvent[] = [];
    
    try {
        const response = await fetch(`${BASE_URL}/api/events`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        events = data.events || [];
    } catch (error) {
        console.error('Failed to fetch events:', error);
        events = [];
    }

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can not Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="pt-26 space-y-7" id="events">
                <h3>Featured Events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event: IEvent) => (
                        <li key={event.title} className="list-none">
                            <EventCard 
                                {...event}
                                id={event._id?.toString()}
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="py-18 md:py-26 space-y-7" id="create-events">
                {/* Event creation moved to /dashboard */}
            </div>
            <div>
                
            </div>
        </section>
    )
}

export default Page;