using Core.Models;

namespace Application.Interfaces.Services
{
    public interface INotificationService
    {
        /// <summary>
        /// Called after an event is approved.
        /// - Pushes a real-time SignalR message to all connected clients.
        /// - Emails every user in the system who has an email address.
        /// </summary>
        Task NotifyEventApprovedAsync(Event approvedEvent);
    }
}
