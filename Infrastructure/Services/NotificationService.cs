using Application.Interfaces.Services;
using Core.AuthModel;
using Core.Models;
using IAProject.Hubs;
using Infrastructure.Repos;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Net.Mail;

namespace Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<EventNotificationHub> _hubContext;
        private readonly GenericRepo<User> _userRepo;
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<EventNotificationHub> hubContext,
            GenericRepo<User> userRepo,
            IOptions<EmailSettings> emailSettings,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _userRepo = userRepo;
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task NotifyEventApprovedAsync(Event approvedEvent)
        {
            
            await _hubContext.Clients.Group("participants").SendAsync("EventApproved", new
            {
                eventId = approvedEvent.id,
                title = approvedEvent.title,
                description = approvedEvent.description,
                location = approvedEvent.Location,
                date = approvedEvent.date,
                image = approvedEvent.Image != null
                     ? Convert.ToBase64String(approvedEvent.Image)
                        : null,

            ticketPrice = approvedEvent.TicketPrice
            });

            _logger.LogInformation(
                "SignalR broadcast sent for approved event '{Title}' (id={Id})",
                approvedEvent.title, approvedEvent.id);

         
            var allEmails = _userRepo
                .GetQueryable()
                .Where(u => !string.IsNullOrEmpty(u.Email)&& u.RoleId==3)
                .Select(u => new { u.FirstName, u.Email })
                .ToList();

            foreach (var user in allEmails)
            {
                try
                {
                    await SendApprovalEmailAsync(user.Email, user.FirstName, approvedEvent);
                    _logger.LogInformation(
                        "Approval email sent to {Email} for event '{Title}'",
                        user.Email, approvedEvent.title);
                }
                catch (Exception ex)
                {
                   
                    _logger.LogError(ex,
                        "Failed to send approval email to {Email}", user.Email);
                }
            }
        }

        // ── Private helpers ───────────────────────────────────────────────────

        private async Task SendApprovalEmailAsync(
            string recipientEmail,
            string recipientFirstName,
            Event ev)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromAddress));
            message.To.Add(MailboxAddress.Parse(recipientEmail));
            message.Subject = $"🎉 New Event Available: \"{ev.title}\"";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;
                                padding:24px;border:1px solid #e0e0e0;border-radius:8px;'>

                        <h2 style='color:#1b4332;'>A new event has just been approved!</h2>

                        <p>Hi {System.Net.WebUtility.HtmlEncode(recipientFirstName)},</p>
                        <p>A new event is now live and open for registration:</p>

                        <table style='width:100%;border-collapse:collapse;margin:16px 0;'>
                            <tr>
                                <td style='padding:8px;font-weight:bold;width:130px;'>Event</td>
                                <td style='padding:8px;'>{System.Net.WebUtility.HtmlEncode(ev.title)}</td>
                            </tr>
                            <tr style='background:#f5f5f5;'>
                                <td style='padding:8px;font-weight:bold;'>Date</td>
                                <td style='padding:8px;'>{ev.date:dddd, MMMM d yyyy — h:mm tt}</td>
                            </tr>
                            <tr>
                                <td style='padding:8px;font-weight:bold;'>Location</td>
                                <td style='padding:8px;'>{System.Net.WebUtility.HtmlEncode(ev.Location)}</td>
                            </tr>
                            <tr style='background:#f5f5f5;'>
                                <td style='padding:8px;font-weight:bold;'>Ticket Price</td>
                                <td style='padding:8px;'>{ev.TicketPrice:C}</td>
                            </tr>
                            <tr>
                                <td style='padding:8px;font-weight:bold;'>Available Tickets</td>
                                <td style='padding:8px;'>{ev.AvailableTickets}</td>
                            </tr>
                        </table>

                        <p style='margin-top:16px;'>
                            {System.Net.WebUtility.HtmlEncode(ev.description)}
                        </p>

                        <a href='http://localhost:3000/events/{ev.id}'
                           style='display:inline-block;margin-top:20px;padding:12px 24px;
                                  background:#2d6a4f;color:#fff;text-decoration:none;
                                  border-radius:6px;font-size:15px;'>
                            View Event &amp; Book Tickets
                        </a>

                        <p style='color:#999;font-size:11px;margin-top:32px;'>
                            You received this because you have an account on IAProject.
                        </p>
                    </div>",

                TextBody =
                    $"New event approved: \"{ev.title}\"\n" +
                    $"Date: {ev.date:dddd, MMMM d yyyy}\n" +
                    $"Location: {ev.Location}\n" +
                    $"Ticket Price: {ev.TicketPrice:C}\n\n" +
                    $"{ev.description}\n\n" +
                    $"Visit: http://localhost:3000/events/{ev.id}"
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new MailKit.Net.Smtp.SmtpClient();
            await client.ConnectAsync(
                _emailSettings.Host,
                _emailSettings.Port,
                _emailSettings.UseSsl
                    ? SecureSocketOptions.SslOnConnect
                    : SecureSocketOptions.StartTlsWhenAvailable);

            await client.AuthenticateAsync(_emailSettings.UserName, _emailSettings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(quit: true);
        }
    }
}
