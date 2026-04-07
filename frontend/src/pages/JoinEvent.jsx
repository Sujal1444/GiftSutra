import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JoinEvent = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loadingJoinedEvents, setLoadingJoinedEvents] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchJoinedEvents = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/events/joined`, {
          withCredentials: true,
        });
        setJoinedEvents(data);
      } catch (fetchError) {
        console.error('Failed to load joined events', fetchError);
      } finally {
        setLoadingJoinedEvents(false);
      }
    };

    fetchJoinedEvents();
  }, [API_URL]);

  const formatEventDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');

    let eventId = '';
    let passcode = '';

    try {
      // Check if it's a URL
      if (input.includes('http://') || input.includes('https://') || input.includes('localhost')) {
        // Prepend https:// if missing to make it a valid URL object
        const urlString = input.startsWith('http') ? input : `https://${input}`;
        const url = new URL(urlString);
        // Extract ID from path (e.g., /events/12345)
        const pathParts = url.pathname.split('/');
        const eventsIndex = pathParts.indexOf('events');
        if (eventsIndex !== -1 && pathParts.length > eventsIndex + 1) {
          eventId = pathParts[eventsIndex + 1];
        }
        
        // Extract passcode from query
        passcode = url.searchParams.get('passcode') || '';
      } else {
        // Assume it's just the ID
        eventId = input.trim();
      }

      if (!eventId) {
        setError('Could not detect a valid Event ID from your input. Please provide the full link or the exact ID.');
        return;
      }

      // Navigate to the event
      if (passcode) {
        navigate(`/events/${eventId}?passcode=${passcode}`);
      } else {
        navigate(`/events/${eventId}`);
      }

    } catch (err) {
      setError('Invalid link format.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Join an Event</h2>
        <p className="text-gray-500 mb-6 text-center">Paste an invite link or Event ID, then join from the event page</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className="mb-6">
            <input
              type="text"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. http://localhost:5173/events/123..."
              className="w-full border-2 border-purple-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
          >
            Open Event
          </button>
        </form>
      </div>

      <section className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Joined Events</h3>
            <p className="text-gray-500">Events you have already joined will appear here.</p>
          </div>
          <div className="bg-purple-50 text-purple-700 font-semibold px-4 py-2 rounded-full">
            {joinedEvents.length} event{joinedEvents.length === 1 ? '' : 's'}
          </div>
        </div>

        {loadingJoinedEvents ? (
          <div className="text-gray-500">Loading joined events...</div>
        ) : joinedEvents.length === 0 ? (
          <div className="border border-dashed border-purple-200 rounded-xl p-8 text-center text-gray-500">
            You have not joined any events yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {joinedEvents.map((event) => (
              <button
                key={event._id}
                type="button"
                onClick={() => navigate(`/events/${event._id}`)}
                className="text-left border border-purple-100 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-purple-50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500">
                      Hosted by {event.organizer?.name || 'Unknown organizer'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {event.rsvpStatus}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {event.description}
                </p>

                <div className="flex flex-col gap-1 text-sm text-gray-500">
                  <span>Event date: {formatEventDate(event.date)}</span>
                  <span>Joined on: {formatEventDate(event.joinedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default JoinEvent;
