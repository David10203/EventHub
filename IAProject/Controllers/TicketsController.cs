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
        [HttpPost("ResrvationTicket/{eventid}/{numberOfTickets}")]
        public async Task<IActionResult> ResrvationTicket(int eventid, int numberOfTickets )
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            var result=  await _ticketService.ResrvationTicket(eventid, numberOfTickets , int.Parse(userIdClaim));
            return Ok(result);
        }
    }
}
