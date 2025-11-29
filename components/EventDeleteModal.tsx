'use client';

import { useState } from 'react';

interface EventDeleteModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

/**
 * EventDeleteModal Component
 * Confirmation dialog for safe event deletion with error handling
 */
export default function EventDeleteModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onDeleteSuccess,
}: EventDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle event deletion
  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete event');
      }

      // Call success callback
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-sm mx-4">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Delete Event</h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {error ? (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                {error}
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">&quot;{eventTitle}&quot;</span>?
                </p>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
