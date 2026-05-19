using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QRCoder;
using System.Drawing;

namespace IAProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : Controller
    {
 
        private ITicketService _ticketService;
        private IHttpContextAccessor _httpContextAccessor;
        public TicketsController( ITicketService ticketService, IHttpContextAccessor httpContextAccessor)
        {

            _ticketService = ticketService;
_httpContextAccessor = httpContextAccessor;
          
        }

        [Authorize(Roles = "participant")]
        [HttpPost("ResrvationTicket/")]
        public async Task<IActionResult> ResrvationTicket([FromBody] ReservationRequest reservation )
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            var result=  await _ticketService.ResrvationTicket(reservation, int.Parse(userIdClaim));
            return Ok(result);
        }
        [HttpGet("GetTickets")]
        [Authorize(Roles = "participant")]
        public async Task<List<TicketResponse>> GetTickets()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
              .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            return await _ticketService.GetTickets(int.Parse(userIdClaim));
        }
    }
}
