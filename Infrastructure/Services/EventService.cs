using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Methods;
using Core.Models;
using Infrastructure.Migrations;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Infrastructure.Services
{
    public class EventService : IEventService
    {
        private GenericRepo<Event> _eventRepo;
        private IMapper mapper;
        private readonly INotificationService _notificationService;  // NEW
        private IHttpContextAccessor _httpContextAccessor;
        public EventService( GenericRepo<Event> eventRepo, IMapper mapper, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)

        {
            _eventRepo = eventRepo;
            this.mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }


        // ── UPDATED: broadcast + email after approval ─────────────────────────
        public async Task<bool> AcceptEvent(int id)
        {
            var approvedEvent = _eventRepo.GetById(id);
            if (approvedEvent == null)
                throw new ArgumentNullException("Event not found");

            approvedEvent.isAccepted = true;
            await _eventRepo.update(approvedEvent);

            // Notify all online users via SignalR and all users via email
            await _notificationService.NotifyEventApprovedAsync(approvedEvent);

            return true;
        }



        public async Task<bool> RevokeEvent(int id)
        {

            var Acceptevent = _eventRepo.GetById(id);
            if (Acceptevent == null)
            {
                throw new ArgumentNullException("Event not found");
            }
            Acceptevent.isAccepted = false;
            await _eventRepo.update(Acceptevent);
            return true;

        }

        public async Task<bool> DeleteEvent(int id)
        {

            var Acceptevent = _eventRepo.GetById(id);
            if (Acceptevent == null)
            {
                throw new ArgumentNullException("Event not found");
            }
            _eventRepo.delete(Acceptevent);
            return true;
        }

        public async Task<bool> AddEvent(EventCreateDTO eventDTO)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            if (userIdClaim == null)
                throw new ValidationException("User not authenticated");


            if (eventDTO.Attachment != null)
            {
                var validationError = FileValidation.ValidateFile(eventDTO.Attachment);
                if (validationError != null)
                    throw new ValidationException( validationError );
            }

            var eventEntity = mapper.Map<Event>(eventDTO);


            eventEntity.AvailableTickets = eventDTO.NumberOfTickets;
            eventEntity.OrganizerId = int.Parse(userIdClaim);


            if (eventDTO.Attachment != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await eventDTO.Attachment.CopyToAsync(memoryStream);
                    eventEntity.AttachmentData = memoryStream.ToArray();
                }

                eventEntity.AttachmentFileName = Path.GetFileName(eventDTO.Attachment.FileName);
                eventEntity.AttachmentContentType = eventDTO.Attachment.ContentType;
            }

            await _eventRepo.insert(eventEntity);

            return true ;
        }

 

        public async Task<List<EventResponseDTO>> GetAllEvents()
        {
            var Events = _eventRepo.GetQueryable().Include(a => a.Category).Include(a => a.User).ToList();
            var mapped = mapper.Map<List<EventResponseDTO>>(Events);
            return mapped;

        }

        public async Task<AttachmentDTO> GetAttachment(int id)
        {
            var ev = await _eventRepo.GetQueryable()
               .Where(e => e.id == id)
               .Select(e => new AttachmentDTO
               {
                   Data = e.AttachmentData,
                   ContentType = e.AttachmentContentType,
                   FileName = e.AttachmentFileName
               })
               .FirstOrDefaultAsync();

            if (ev == null || ev.Data == null)
                throw new ArgumentNullException("No attachment found");

            return ev;
        }

        public async Task<EventResponseDTO> GetEventById(int id)
        {
            var test = _eventRepo.GetQueryable().Include(a => a.Category).Include(a => a.User).FirstOrDefault(a => a.id == id);
            var mapped = mapper.Map<EventResponseDTO>(test);
            return mapped;
        }

        public async Task<bool> UpdateEvent(int eventId, EventCreateDTO eventDTO)
        {
            var GetEvent = _eventRepo.GetById(eventId);


            if (GetEvent == null) throw new ArgumentNullException("Event not found");

            mapper.Map(eventDTO, GetEvent);

            if (eventDTO.Attachment != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await eventDTO.Attachment.CopyToAsync(memoryStream);
                    GetEvent.AttachmentData = memoryStream.ToArray();
                }

                GetEvent.AttachmentFileName = Path.GetFileName(eventDTO.Attachment.FileName);
                GetEvent.AttachmentContentType = eventDTO.Attachment.ContentType;
            }
            await _eventRepo.update(GetEvent);
            return true;
        }

        public async Task<object> Analytics()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            var revenue = _eventRepo.GetQueryable().Where(a=>a.OrganizerId==int.Parse(userIdClaim)).Sum(a => a.TicketPrice * (a.NumberOfTickets - a.AvailableTickets));
            var TicketsSold = _eventRepo.GetQueryable().Where(a=>a.OrganizerId==int.Parse(userIdClaim)).Sum(a => a.NumberOfTickets - a.AvailableTickets);
            return new
            {
                Revenue = revenue,
                TicketSold = TicketsSold
            };
        }
    }
}
