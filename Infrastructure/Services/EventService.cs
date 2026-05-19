using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Enums;
using Core.Methods;
using Core.Models;
using Infrastructure.Migrations;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;


namespace Infrastructure.Services
{
    public class EventService : IEventService
    {
        private GenericRepo<Event> _eventRepo;
        private IMapper mapper;
        private readonly INotificationService _notificationService;  
        private IHttpContextAccessor _httpContextAccessor;
        private GenericRepo<Cart> _cartRepo;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        public EventService(
            GenericRepo<Event> eventRepo,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor, 
            INotificationService notificationService, 
            GenericRepo<Cart> cartRepo,
            IServiceScopeFactory serviceScopeFactory)


        {
            _serviceScopeFactory = serviceScopeFactory;
            _eventRepo = eventRepo;
            this.mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
            _cartRepo = cartRepo;
        }


    
        public async Task<bool> AcceptEvent(int id)
        {
            var approvedEvent = _eventRepo.GetById(id);
            if (approvedEvent == null)
                throw new ArgumentNullException("Event not found");

            approvedEvent.isAccepted = ApprovalEnums.Approved;
            await _eventRepo.update(approvedEvent);


            _ = Task.Run(async () =>
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await notifService.NotifyEventApprovedAsync(approvedEvent);
            });

            return true;
        }



        public async Task<bool> RevokeEvent(int id)
        {

            var Acceptevent = _eventRepo.GetById(id);
            if (Acceptevent == null)
            {
                throw new ArgumentNullException("Event not found");
            }
            Acceptevent.isAccepted = ApprovalEnums.Pending;
            await _eventRepo.update(Acceptevent);
            return true;

        }



        public async Task<bool> RejectEvent(int id)
        {

            var Acceptevent = _eventRepo.GetById(id);
            if (Acceptevent == null)
            {
                throw new ArgumentNullException("Event not found");
            }
            Acceptevent.isAccepted = ApprovalEnums.Rejected;
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
            await _eventRepo.delete(Acceptevent);
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
                    throw new ValidationException(validationError);
            }
            if(eventDTO.Date < DateTime.Now)
            {
                throw new ValidationException("Date must be in the future");
            }

            var eventEntity = mapper.Map<Event>(eventDTO);


            eventEntity.AvailableTickets = eventDTO.NumberOfTickets;
            eventEntity.OrganizerId = int.Parse(userIdClaim);

            if (eventDTO.Image != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await eventDTO.Image.CopyToAsync(memoryStream);
                    eventEntity.Image = memoryStream.ToArray();
                }


            }

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

            return true;
        }



        public async Task<List<EventResponseDTO>> GetAllEvents()
        {
            var role = _httpContextAccessor.HttpContext?.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value;
            if (role == null|| role == "participant")
            {
                var Events1 = _eventRepo.GetQueryable().Include(a => a.Category).Include(a => a.User).Where(a => a.date > DateTime.Now&& a.isAccepted==ApprovalEnums.Approved).ToList();
                var mapped1 = mapper.Map<List<EventResponseDTO>>(Events1);

                return mapped1;
            }
            var Events = _eventRepo.GetQueryable().Include(a => a.Category).Include(a => a.User).Where(a => a.date > DateTime.Now).ToList();

            var mapped = mapper.Map<List<EventResponseDTO>>(Events);


            

                //for (int i = 0; i < mapped.Count; i++)
                //{
                //    if (Events[i].Image != null)
                //    {
                //        mapped[i].Image = Convert.ToBase64String(Events[i].Image);
                //    }
                //    else
                //    {
                //        continue;
                //    }
                //}

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


        public async Task<AttachmentDTO> GetImage(int id)
        {
            var ev = await _eventRepo.GetQueryable()
               .Where(e => e.id == id)
               .Select(e => new AttachmentDTO
               {


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
            mapped.Image = Convert.ToBase64String(test.Image);


            return mapped;
        }

        public async Task<bool> UpdateEvent(int eventId, EventCreateDTO eventDTO)
        {
            var GetEvent = _eventRepo.GetById(eventId);


            if (GetEvent == null) throw new ArgumentNullException("Event not found");

            mapper.Map(eventDTO, GetEvent);



            if (eventDTO.Image != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await eventDTO.Image.CopyToAsync(memoryStream);
                    GetEvent.Image = memoryStream.ToArray();
                }


            }

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

            GetEvent.AvailableTickets = eventDTO.NumberOfTickets;
            GetEvent.isAccepted=ApprovalEnums.Pending;


            await _eventRepo.update(GetEvent);

          

            return true;
        }

        public async Task<object> Analytics()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            var revenue = _eventRepo.GetQueryable().Where(a => a.OrganizerId == int.Parse(userIdClaim)).ToList();
            var TicketsSold = _eventRepo.GetQueryable().Where(a => a.OrganizerId == int.Parse(userIdClaim)).Sum(a => a.NumberOfTickets - a.AvailableTickets);
            return new
            {
                Revenue = revenue,
                TicketSold = TicketsSold
            };
        }

        public async Task<List<CartDTO>> GetListOfEvents(List<int> EventIds)
        {
            List<CartDTO> list = new List<CartDTO>();
            foreach (var EventId in EventIds)
            {
                if (EventId == null) throw new ArgumentNullException("Event not found");
                var Event = _eventRepo.GetById(EventId);
                if (Event == null) throw new ArgumentNullException("Event not found");
                var mapped = mapper.Map<CartDTO>(Event);
                list.Add(mapped);


            }
            return list;

        }

        public async Task<List<CartDTO>> GetCartEvents()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            var Events = _cartRepo.GetQueryable().Where(a => a.UserId == int.Parse(userIdClaim)).ToList();
            List<CartDTO> list = new List<CartDTO>();
            foreach (var id in Events)
            {
                var Event = _eventRepo.GetById(id.EventId);
                if (Event == null) throw new ArgumentNullException("Event not found");
                var mapped = mapper.Map<CartDTO>(Event);
                list.Add(mapped);
            }
            return list;

        }

        public async Task<bool> ClearCart()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
            .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            await _cartRepo.ClearCart(int.Parse(userIdClaim));
            return true;

        }

        public async Task<bool> DeleteEventFromCart(int eventid)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
           .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            var CartEvent = _cartRepo.GetQueryable().Where(a => a.UserId == int.Parse(userIdClaim) && a.EventId == eventid).FirstOrDefault();

            await _cartRepo.delete(CartEvent);
            return true;
        }


    }
}
