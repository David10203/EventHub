// src/hooks/useEventNotifications.js
import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { useApp } from '../context/AppContext';

/**
 * Connects to the backend SignalR hub once the user is logged in.
 * When the admin approves an event, the server fires "EventApproved"
 * and this hook pushes a new entry into the existing notifications list
 * in AppContext — which the Navbar bell already reads and renders.
 *
 * Drop this hook inside AppProvider (AppContext.js) or in App.jsx.
 */
export function useEventNotifications() {
  const { user, setNotifications } = useApp();

  useEffect(() => {
    // Only connect when a user is logged in
    if (!user) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.225.22.190:5000/hubs/events', {
        // Send JWT so the hub can identify the user if needed
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // "EventApproved" matches what the backend hub broadcasts
    connection.on('EventApproved', (event) => {
      setNotifications(prev => [
        {
          id:   Date.now(),                                         // unique key for React
          text: `🎉 New event available: "${event.title}"`,
          time: 'just now',
          read: false,
          eventId: event.eventId,                                   // handy if you want a link later
        },
        ...prev,                                                    // newest first
      ]);
    });

    connection.start().catch(err =>
      console.error('SignalR connection error:', err)
    );

    // Clean up when user logs out or component unmounts
    return () => { connection.stop(); };

  }, [user]);   // re-run when user logs in or out
}