using Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IEventService
    {
        Task<bool> AddEvent(EventCreateDTO eventDTO);
        Task <List<EventResponseDTO>> GetAllEvents();
        Task<EventResponseDTO> GetEventById(int id);
        Task<bool> UpdateEvent(int eventId,EventCreateDTO eventDTO);
        Task<bool> DeleteEvent(int id);

        Task <bool> AcceptEvent(int id);
        Task <AttachmentDTO> GetAttachment(int id);
        Task<object> Analytics();

        Task<bool> RevokeEvent(int id);
      

    }
}
