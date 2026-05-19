using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.AuthModel;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace IAProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private IUserService _userService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UsersController( IUserService userService, IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [Authorize(policy: "Update")]
        [HttpPut("approve/{userId}")]
        public async Task<IActionResult> Approve(int userId)
        {
            await _userService.Approve(userId);
            return Ok(new { message = "User approved" });
        }
        [Authorize(Roles = "participant")]
        [HttpPost("AddEventToFavorites/{eventId}")]
        public async Task<IActionResult> AddEventToFavorites(int eventId)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            await _userService.AddEventToFavorite(int.Parse(userIdClaim), eventId);
            return Ok(new { message = "Event added to favorites" });
        }
        [Authorize(Roles = "participant")]
        [HttpGet("GetFavorites")]
        public Task<List<FavortitesDTO>> GetFavorites()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            return _userService.GetFavorites(int.Parse(userIdClaim));

        }
        [Authorize(Roles = "participant")]
        [HttpPost("AddRate/{eventId}/{rate}")]
        public async Task<IActionResult> AddRate(int eventId, int rate)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            await _userService.AddRate(int.Parse(userIdClaim), eventId, rate);
            return Ok(new { message = "Rate added" });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("GetAnalitycs")]
        public async Task<object> GetAnalytics()
        {
            return await _userService.GetAnalytics();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllUsers")]
        public  Task<List<UserResponseDTO>> GetAllUsers()
        {
            return _userService.GetAllUsers();
        
        }

        [HttpPut("RevokeUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeUser(int id)
        {
            await _userService.RevokeUser(id);
            return Ok(new { message = "User revoked" });
        }



        [HttpPut("RejectUser/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectUser(int id)
        {
            await _userService.RejectUser(id);
            return Ok(new { message = "User Rejected" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetUser/{id}")]
        public async Task<User> GetUser(int id)
        {
            return await _userService.GetUser(id);
        }

        [Authorize(Roles="Admin")]
        [HttpDelete("DeleteUser/{id}")] 
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _userService.DeleteUser(id);
            return Ok(new { message = "User deleted" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateUser/{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserDTORegister user)
        {
            await _userService.UpdateUser(id, user);
            return Ok(new { message = "User updated" });
        }



        [HttpPost("refresh")]
public async Task<object> Refresh(TokenRequest request)
{
        var response = await _userService.Refresh(request);
    if (response == null)
    {
        return BadRequest(new { message = "Invalid token" });
    }
    return Ok(response);
}

        [Authorize(Roles = "participant")]
        [HttpPost("Booking/{eventId}")]
        public async Task<IActionResult> Booking(int eventId)
        {
            var userid = _httpContextAccessor.HttpContext?.User?
               .Claims.FirstOrDefault(x => x.Type == "userid")?.Value;
            await _userService.Booking(int.Parse(userid), eventId);
            return Ok(new { message = "Event Booked" });

        }
        
        [HttpDelete("DeleteFromFav/{eventid}")]
        public async Task<bool> DeleteFromFav(int eventid)
        {
       
            return await _userService.DeleteFromFav(eventid);
        }



    }
      
        
    }

