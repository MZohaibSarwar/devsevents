'use client';

import { useState } from 'react';

// Type for form state
interface EventFormData {
  title: string;
  description: string;
  overview: string;
  image: File | null;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Type for form errors
interface FormErrors {
  [key: string]: string;
}

interface EventEditFormProps {
  eventId: string;
  initialData?: {
    title: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
  };
  onSuccess?: () => void;
}

/**
 * EventEditForm Component
 * Form to edit existing events with prefilled data
 */
export default function EventEditForm({ eventId, initialData, onSuccess }: EventEditFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    overview: initialData?.overview ?? '',
    image: null,
    venue: initialData?.venue ?? '',
    location: initialData?.location ?? '',
    date: initialData?.date ?? '',
    time: initialData?.time ?? '',
    mode: initialData?.mode ?? 'offline',
    audience: initialData?.audience ?? '',
    agenda: initialData?.agenda ?? [],
    organizer: initialData?.organizer ?? '',
    tags: initialData?.tags ?? [],
  });

  const [imagePreview, setImagePreview] = useState<string>(initialData?.image ?? '');
  const [agendaInput, setAgendaInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';

    if (!formData.overview.trim()) newErrors.overview = 'Overview is required';

    // Image is optional on edit (only validate if a new file is selected)
    if (formData.image) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validImageTypes.includes(formData.image.type)) {
        newErrors.image = 'Image must be JPEG, PNG, WebP, or GIF';
      }
      if (formData.image.size > 5 * 1024 * 1024) {
        newErrors.image = 'Image size must be less than 5MB';
      }
    }

    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.audience.trim()) newErrors.audience = 'Target audience is required';
    if (formData.agenda.length === 0) newErrors.agenda = 'Add at least one agenda item';
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer name is required';
    if (formData.tags.length === 0) newErrors.tags = 'Add at least one tag';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof EventFormData
  ) => {
    if (field === 'image') return;

    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: '' }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Add agenda item
  const addAgendaItem = () => {
    if (agendaInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        agenda: [...prev.agenda, agendaInput.trim()],
      }));
      setAgendaInput('');
      setErrors((prev) => ({ ...prev, agenda: '' }));
    }
  };

  // Remove agenda item
  const removeAgendaItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()],
      }));
      setTagInput('');
      setErrors((prev) => ({ ...prev, tags: '' }));
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Build FormData to support file upload (optional)
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('overview', formData.overview);
      if (formData.image) data.append('image', formData.image);
      data.append('venue', formData.venue);
      data.append('location', formData.location);
      data.append('date', formData.date);
      data.append('time', formData.time);
      data.append('mode', formData.mode);
      data.append('audience', formData.audience);
      data.append('organizer', formData.organizer);
      data.append('agenda', JSON.stringify(formData.agenda));
      data.append('tags', JSON.stringify(formData.tags));

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        body: data,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to update event');
      }

      setMessage({ type: 'success', text: `Event "${responseData.event?.title}" updated successfully!` });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Event</h1>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange(e, 'title')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event title"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange(e, 'description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the event"
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Overview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overview *
          </label>
          <textarea
            value={formData.overview}
            onChange={(e) => handleInputChange(e, 'overview')}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief overview of the event"
          />
          {errors.overview && <p className="text-red-600 text-sm mt-1">{errors.overview}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Image (optional to update)
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-auto rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: null }));
                  setImagePreview('');
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition block text-center">
              <div className="text-gray-600">
                <p className="text-lg font-medium mb-2">Click to upload image</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          {errors.image && <p className="text-red-600 text-sm mt-2">{errors.image}</p>}
        </div>

        {/* Venue and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue *
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange(e, 'venue')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Convention Center"
            />
            {errors.venue && <p className="text-red-600 text-sm mt-1">{errors.venue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange(e, 'location')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., New York, USA"
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange(e, 'date')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange(e, 'time')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Mode and Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode *
            </label>
            <select
              value={formData.mode}
              onChange={(e) => handleInputChange(e, 'mode')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) => handleInputChange(e, 'audience')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Developers, Designers"
            />
            {errors.audience && <p className="text-red-600 text-sm mt-1">{errors.audience}</p>}
          </div>
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer Name *
          </label>
          <input
            type="text"
            value={formData.organizer}
            onChange={(e) => handleInputChange(e, 'organizer')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Tech Community"
          />
          {errors.organizer && <p className="text-red-600 text-sm mt-1">{errors.organizer}</p>}
        </div>

        {/* Agenda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agenda Items *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={agendaInput}
              onChange={(e) => setAgendaInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAgendaItem())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add agenda item and press Enter"
            />
            <button
              type="button"
              onClick={addAgendaItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>

          {formData.agenda.length > 0 && (
            <div className="space-y-2">
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.agenda && <p className="text-red-600 text-sm mt-2">{errors.agenda}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.tags && <p className="text-red-600 text-sm mt-2">{errors.tags}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating Event...' : 'Update Event'}
        </button>
      </form>
    </div>
  );
}
