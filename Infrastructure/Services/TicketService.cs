using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Infrastructure.Services
{
    public class TicketService : ITicketService
    {
        private GenericRepo<Ticket> _ticketRepo;
        private GenericRepo<Event> _eventRepo;
        private GenericRepo<User> _userRepo;
        private IMapper _mapper;
        private GenericRepo<UserEvent> _UsereventRepo;

        public TicketService(GenericRepo<Ticket> ticketRepo, GenericRepo<Event> eventRepo, GenericRepo<User> userRepo, GenericRepo<UserEvent> usereventRepo, IMapper mapper)
        {
            _mapper = mapper;
            _ticketRepo = ticketRepo;
            _eventRepo = eventRepo;
            _userRepo = userRepo;
            _UsereventRepo = usereventRepo;

        }

        public async Task<object> ResrvationTicket(ReservationRequest reservation, int userid)
        {
            var user = _userRepo.GetById(userid);

            List<string> qrCodes = new List<string>();

            foreach (var i in reservation.Items)
            {
                var eventresrved = _eventRepo.GetById(i.EventId);
                if (eventresrved == null) throw new ArgumentNullException("Event not found");

                if (eventresrved.AvailableTickets < i.NumberOfTickets) throw new Exception("Not enough tickets available");

                eventresrved.AvailableTickets -= i.NumberOfTickets;
                await _eventRepo.update(eventresrved);



                //var userEvent = _UsereventRepo.GetQueryable()
                //.FirstOrDefault(x => x.UserId == userid && x.EventId == i.EventId);

                //if (userEvent == null)
                //{
                //    await _UsereventRepo.insert(new UserEvent
                //    {

                //        UserId = userid,
                //        EventId = i.EventId,
                //        IsFavorite = false
                //    });
                //}



                for (int j = 0; j < i.NumberOfTickets; j++)
                {
                    var ticket = new Ticket
                    {

                        Quantity = 1,
                        UserName = user.FirstName + " " + user.LastName,
                        UserId = userid,
                        EventId = i.EventId,
                        TicketPrice = eventresrved.TicketPrice
                    };

                    await _ticketRepo.insert(ticket);


                    var qrData = JsonConvert.SerializeObject(new
                    {
                        ticket.Id,
                        userid,
                        i.EventId
                    });

                    using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                    {
                        var qrCodeData = qrGenerator.CreateQrCode(qrData, QRCodeGenerator.ECCLevel.Q);
                        var qrCode = new QRCode(qrCodeData);

                        using (Bitmap qrImage = qrCode.GetGraphic(20))
                        using (MemoryStream ms = new MemoryStream())
                        {
                            qrImage.Save(ms, System.Drawing.Imaging.ImageFormat.Png);

                            var qrBytes = ms.ToArray();


                            ticket.Qr = qrBytes;

                            await _ticketRepo.update(ticket);

                            //qrCodes.Add(Convert.ToBase64String(ms.ToArray()));

                        }
                    }

                }
            }

            return new
            {
                Message = "Tickets reserved successfully",
                //QRCodes = qrCodes
            };

        }


        public async Task<List<TicketResponse>> GetTickets(int userid)
        {
            var tickets = _ticketRepo.GetQueryable().Where(x => x.UserId == userid).Include(x => x.Events).ToList();
            
            var mapped = _mapper.Map<List<TicketResponse>>(tickets);

            
            return mapped;
        }

    }
}

