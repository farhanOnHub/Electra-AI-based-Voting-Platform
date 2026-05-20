import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchEvents = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${apiUrl}/events?${params}`);
      setEvents(response.data.events);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventById = async (eventId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/events/${eventId}`);
      setCurrentEvent(response.data.event);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await axios.post(`${apiUrl}/events`, eventData, { headers });
      setEvents([...events, response.data.event]);
      return response.data.event;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to create event' };
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await axios.put(`${apiUrl}/events/${eventId}`, eventData, { headers });
      setEvents(events.map(e => e._id === eventId ? response.data.event : e));
      if (currentEvent?._id === eventId) {
        setCurrentEvent(response.data.event);
      }
      return response.data.event;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to update event' };
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`${apiUrl}/events/${eventId}`, { headers });
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err) {
      throw err.response?.data || { message: 'Failed to delete event' };
    }
  };

  const joinEvent = async (eventCode) => {
    try {
      const response = await axios.post(`${apiUrl}/events/code`, { eventCode });
      return response.data.event;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to join event' };
    }
  };

  const getUserEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/events/user/events`, { headers });
      return response.data;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to fetch user events' };
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      currentEvent,
      loading,
      error,
      fetchEvents,
      fetchEventById,
      createEvent,
      updateEvent,
      deleteEvent,
      joinEvent,
      getUserEvents
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within EventProvider');
  }
  return context;
};
