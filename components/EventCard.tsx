'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EventEditForm from './EventEditForm';
import EventDeleteModal from './EventDeleteModal';

interface Props {
  id?: string;
  title: string;
  image: string;
  slug?: string;
  location?: string;
  date?: string;
  time?: string;
  description?: string;
  overview?: string;
  venue?: string;
  mode?: string;
  audience?: string;
  agenda?: string[];
  organizer?: string;
  tags?: string[];
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  showActions?: boolean;
}

/**
 * EventCard Component
 * Displays event with optional Edit/Delete action buttons
 */
const EventCard = ({
  id,
  title,
  image,
  slug,
  location,
  date,
  time,
  description = '',
  overview = '',
  venue = '',
  mode = 'offline',
  audience = '',
  agenda = [],
  organizer = '',
  tags = [],
  onDeleteSuccess,
  onEditSuccess,
  showActions = false,
}: Props) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get mode badge color
  // const getModeColor = (eventMode: string | undefined): string => {
  //   switch (eventMode?.toLowerCase()) {
  //     case 'online':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'offline':
  //       return 'bg-green-100 text-green-800';
  //     case 'hybrid':
  //       return 'bg-purple-100 text-purple-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  // Show edit form instead of card
  if (showEditForm && id) {
    const modeValue: 'online' | 'offline' | 'hybrid' = 
      (mode === 'online' || mode === 'offline' || mode === 'hybrid') ? mode : 'offline';
    
    return (
      <EventEditForm
        eventId={id}
        initialData={{
          title,
          description,
          overview,
          image,
          venue,
          location: location || '',
          date: date || '',
          time: time || '',
          mode: modeValue,
          audience,
          agenda,
          organizer,
          tags,
        }}
        onSuccess={() => {
          setShowEditForm(false);
          if (onEditSuccess) onEditSuccess();
        }}
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-50 overflow-hidden bg-gray-200">
          <Image
            src={image}
            alt={title}
            width={410}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          {/* {showActions && mode && (
            <div className="absolute top-3 right-3">
              <span className={`${getModeColor(mode)} rounded-full px-2 py-1 text-xs font-medium`}>
                {mode}
              </span>
            </div>
          )} */}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col grow">
          {/* Title */}
          <Link href={`/events/${slug}`}>
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition">
              {title}
            </h3>
          </Link>

          {/* Location, Date, Time */}
          <div className="space-y-1 mb-2 text-sm text-gray-600">
            {location && (
              <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location pin" width={14} height={14} />
                <p>{location}</p>
              </div>
            )}
            {date || time ? (
              <div className="datetime flex gap-4 text-xs">
                {date && (
                  <div className="flex gap-1">
                    <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
                    <p>{date}</p>
                  </div>
                )}
                {time && (
                  <div className="flex gap-1">
                    <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
                    <p>{time}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Description */}
          {description && <p className="text-gray-700 text-sm mb-3 line-clamp-2">{description}</p>}

          {/* Organizer & Audience */}
          {/* {showActions && (organizer || audience) && (
            <div className="flex justify-between text-xs text-gray-600 mb-3">
              {organizer && <p className="font-semibold">👤 {organizer}</p>}
              {audience && <p className="font-semibold">👥 {audience}</p>}
            </div>
          )} */}

          {/* Tags */}
          {/* {showActions && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )} */}

          {/* Action Buttons */}
          {showActions && id && (
            <div className="flex gap-2 pt-3 border-t border-gray-200 mt-auto">
              <button
                onClick={() => setShowEditForm(true)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showActions && id && (
        <EventDeleteModal
          eventId={id}
          eventTitle={title}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDeleteSuccess={() => {
            setShowDeleteModal(false);
            if (onDeleteSuccess) onDeleteSuccess();
          }}
        />
      )}
    </>
  );
};

export default EventCard;
