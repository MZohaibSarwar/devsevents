import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";
import {cacheLife} from "next/cache";
import EventForm from "@/components/EventForm";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    'use cache';
    cacheLife('hours')
    const response = await fetch(`${BASE_URL}/api/events`);
    const { events } = await response.json();

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
                                showActions={true} 
                            />
                        </li>
                    ))}
                </ul>
            </div>
            <div className="py-18 md:py-26 space-y-7" id="create-events">
                <EventForm />
            </div>
            <div>
                
            </div>
        </section>
    )
}

export default Page;