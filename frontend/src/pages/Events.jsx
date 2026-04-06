import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const authToken = token || localStorage.getItem('token');
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/events/myevents`,
          authToken
            ? {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            : undefined
        );
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events', error);
        setError(error.response?.data?.message || 'Failed to load your events');

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [authLoading, isAuthenticated, navigate, token]);

  if (authLoading || loading) {
    return <div className="text-center mt-10 text-purple-600">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">My Events</h1>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          No events yet. Create one and it will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <Link to={`/events/${event._id}`} key={event._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="h-48 bg-purple-100 relative overflow-hidden">
                {event.coverImage ? (
                  <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                    <span className="text-white font-bold opacity-50">NO IMAGE</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-purple-900">{event.title}</h2>
                <p className="text-sm text-gray-600 mb-2">Organizer: {event.organizer?.name || 'Unknown'}</p>
                <p className="text-xs text-purple-600 font-bold bg-purple-50 inline-block px-2 py-1 rounded">
                  Date: {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
