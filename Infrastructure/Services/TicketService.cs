using Application.Interfaces.Services;
using Core.Models;
using Infrastructure.Repos;
using Newtonsoft.Json;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class TicketService : ITicketService
    {
        private GenericRepo<Ticket> _ticketRepo;
        private GenericRepo<Event> _eventRepo;
        private GenericRepo<User> _userRepo;
        private GenericRepo<UserEvent> _UsereventRepo;

        public TicketService( GenericRepo<Ticket> ticketRepo, GenericRepo<Event> eventRepo, GenericRepo<User> userRepo, GenericRepo<UserEvent> usereventRepo)
        {
            _ticketRepo = ticketRepo;
            _eventRepo = eventRepo;
            _userRepo = userRepo;
            _UsereventRepo = usereventRepo;
            
        }

        public async Task<object> ResrvationTicket(int eventid, int numberOfTickets, int userid)
        {
            var eventresrved = _eventRepo.GetById(eventid);
            if (eventresrved == null)
                throw new Exception("Event not found");

            var user = _userRepo.GetById(userid);
            if (user == null)
                throw new Exception("User not found");

            if (numberOfTickets <= 0)
                throw new ArgumentException("Invalid ticket number");

            if (numberOfTickets > eventresrved.AvailableTickets)
                throw new ArgumentException("Not enough tickets");


            eventresrved.AvailableTickets -= numberOfTickets;
            await _eventRepo.update(eventresrved);


            var userEvent = _UsereventRepo.GetQueryable()
                .FirstOrDefault(x => x.UserId == userid && x.EventId == eventid);

            if (userEvent == null)
            {
                await _UsereventRepo.insert(new UserEvent
                {

                    UserId = userid,
                    EventId = eventid,
                    IsFavorite = false
                });
            }

            List<string> qrCodes = new List<string>();

            var ticket = new Ticket
            {

                Quantity = numberOfTickets,
                UserName = user.FirstName + " " + user.LastName,
                UserId = userid,
                EventId = eventid,
                TicketPrice = eventresrved.TicketPrice
            };

            await _ticketRepo.insert(ticket);


            for (int i = 0; i < numberOfTickets; i++)
            {
                var ticketqr = new Ticket
                {


                    UserName = user.FirstName + " " + user.LastName,
                    UserId = userid,
                    EventId = eventid,
                    TicketPrice = eventresrved.TicketPrice 
                };



                var qrData = JsonConvert.SerializeObject(new
                {
                    ticket.Id,
                    userid,
                    eventid
                });

                using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                {
                    var qrCodeData = qrGenerator.CreateQrCode(qrData, QRCodeGenerator.ECCLevel.Q);
                    var qrCode = new QRCode(qrCodeData);

                    using (Bitmap qrImage = qrCode.GetGraphic(20))
                    using (MemoryStream ms = new MemoryStream())
                    {
                        qrImage.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                        qrCodes.Add(Convert.ToBase64String(ms.ToArray()));
                    }
                }
            }

            return new
            {
                Message = "Tickets reserved successfully",
                QRCodes = qrCodes
            };
        }
    }
    }

