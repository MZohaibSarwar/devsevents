'use client';

import { useState } from 'react';
import Image from 'next/image';
import EventEditForm from './EventEditForm';
import EventDeleteModal from './EventDeleteModal';

interface DashboardEventCardProps {
  id: string;
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
}

/**
 * DashboardEventCard Component
 * Event card for dashboard with Edit/Delete action buttons
 */
const DashboardEventCard = ({
  id,
  title,
  image,
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
}: DashboardEventCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Show edit form instead of card
  if (showEditForm) {
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header with Title and Action Buttons */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{title}</h3>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setShowEditForm(true)}
              className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition"
              title="Edit event"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition"
              title="Delete event"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <Image
            src={image}
            alt={title}
            width={410}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Location, Date, Time */}
          <div className="space-y-1 mb-3 text-sm text-gray-600">
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

          {/* Additional Info */}
          <div className="space-y-1 text-xs text-gray-600">
            {organizer && <p><strong>Organizer:</strong> {organizer}</p>}
            {audience && <p><strong>Audience:</strong> {audience}</p>}
            {mode && <p><strong>Mode:</strong> <span className="capitalize">{mode}</span></p>}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
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
    </>
  );
};

export default DashboardEventCard;
