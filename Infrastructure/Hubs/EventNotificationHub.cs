using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

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
        public override async Task OnConnectedAsync()
        {
            var role = Context.User?.Claims
                .FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value;

            if (role == "participant")
                await Groups.AddToGroupAsync(Context.ConnectionId, "participants");

            await base.OnConnectedAsync();
        }


    }
}
