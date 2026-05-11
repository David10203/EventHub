using Microsoft.AspNetCore.SignalR;

namespace IAProject.Hubs
{
    /// <summary>
    /// Clients connect to this hub to receive real-time event notifications.
    /// No authentication required — any visitor can be notified about
    /// newly approved public events.
    ///
    /// Client-side: connect to /hubs/events and listen for "EventApproved".
    /// </summary>
    public class EventNotificationHub : Hub
    {
        // No server-side methods needed — the server only pushes to clients.
        // Add methods here later if clients need to send messages to the server.
    }
}
