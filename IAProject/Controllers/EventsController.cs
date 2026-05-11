using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Interfaces;
using Core.Methods;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace IAProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : Controller
    {
  
        private IEventService _eventService;
        public EventsController(IEventService eventService) {
            _eventService = eventService;

        }
        [Authorize(Roles = "EventOrganizer,Admin")]
        [Authorize(policy: "Add")]
        [HttpPost]
        public async Task<IActionResult> AddEvent( EventCreateDTO test)
        {
           
            await _eventService.AddEvent(test);

            return Ok(new { message = "Event added" });
        }
        
        [HttpGet]
        
        public async Task<List<EventResponseDTO>> GetEvents()
        {
           return await _eventService.GetAllEvents();

        }
        [Authorize(Roles = "Admin,EventOrganizer")]
      
        [HttpDelete("{id}")]
        public async Task<IActionResult> deleteEvent(int id)
        {
           await _eventService.DeleteEvent(id);
            return Ok(new { message = "Event deleted" });
        }
        [HttpGet("{id}")]
        public async Task<EventResponseDTO> GetEvent(int id)
        {
            return await _eventService.GetEventById(id);
        }
        [Authorize(Roles = "Admin,EventOrganizer")]
    
        [HttpPut("{id}")]
        public  async Task<IActionResult> updateEvent(int id, EventCreateDTO test)
        {
            await _eventService.UpdateEvent(id, test);
            return Ok(new { message = "Event updated" });
        }
        [HttpPut("AcceptEvent/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AcceptEvent(int id) { 
            
            await _eventService.AcceptEvent(id);
            return Ok(new { message = "Event accepted" });

        }

        [HttpPut("RevokeEvent/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeEvent(int id)
        {
            await _eventService.RevokeEvent(id);
            return Ok(new { message = "Event revoked" });
        }


        [HttpDelete("DeleteEvent/{id}")]
        [Authorize(Roles = "Admin,EventOrganizer")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            await _eventService.DeleteEvent(id);
            return Ok(new { message = "Event deleted" });
        }

    
        [Authorize(Roles = "Admin,EventOrganizer")]
       
        [HttpGet("{id}/attachment")]
        public async Task<IActionResult> GetAttachment(int id)
        {
            var file = await _eventService.GetAttachment(id);

            return File(file.Data, file.ContentType, file.FileName);
        }

        [HttpGet("GetDashboardAnalytics")]
        public async Task<object> GetDashboardAnalytics()
        {
            return await _eventService.Analytics();
        }
    }
}
