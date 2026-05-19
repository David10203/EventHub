using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.AuthModel;
using Core.Enums;
using Core.Methods;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Immutable;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;

using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly GenericRepo<User> _userRepo;
        private readonly GenericRepo<UserEvent> _UsereventRepo;
        private readonly GenericRepo<Role> _RoleRepo;
        private readonly GenericRepo<Event> _eventRepo;
        private readonly GenericRepo<Ticket> _TicketRepo;
        private readonly GenericRepo<Permission> _PermissionRepo;
        private readonly GenericRepo<RefreshToken> _RefreshTokenRepo;
        private readonly GenericRepo<Cart> _cartRepo;
        private IHttpContextAccessor httpContextAccessor;
        private JWT _jwt;
        private readonly IMapper mapper;
        private GenJwt genJwt ;
        public UserService( IHttpContextAccessor httpContextAccessor ,GenericRepo<User> userRepo, IMapper mapper, GenericRepo<UserEvent> usereventRepo, GenericRepo<Role> roleRepo, GenericRepo<Event> eventRepo, GenericRepo<Ticket> ticketRepo, GenericRepo<Permission> permissionRepo,IOptions<JWT> jwt, GenericRepo<RefreshToken> refreshTokenRepo, GenJwt genJwt, GenericRepo<Cart> cartRepo)
        {
            this.httpContextAccessor = httpContextAccessor;
            this.genJwt = genJwt;
            _jwt = jwt.Value;
            this.mapper = mapper;
            _userRepo = userRepo;
           _UsereventRepo = usereventRepo;
            _RoleRepo = roleRepo;
            _eventRepo = eventRepo;
            _TicketRepo = ticketRepo;
            _PermissionRepo = permissionRepo; 
            _cartRepo = cartRepo;
            _RefreshTokenRepo = refreshTokenRepo;
        }
        public async Task<bool> AddEventToFavorite(int userId, int eventId)
        {
            var user = _userRepo.GetById(userId);
            var eventt = _eventRepo.GetById(eventId);
            if (user == null || eventt == null) throw new ArgumentNullException ("User not found Or Event not found");
            var userEvent = _UsereventRepo.GetQueryable()
                    .FirstOrDefault(x => x.UserId == userId && x.EventId == eventId);

            if (userEvent != null)
            {
                userEvent.IsFavorite = true;
                await _UsereventRepo.update(userEvent);
            }
            else
            {

                await _UsereventRepo.insert(new UserEvent
                {
                    UserId = userId,
                    EventId = eventId,
                    IsFavorite = true
                });
            }
            return true;
        }

        public async Task<bool> AddRate(int userId, int eventId, int rate)
        {
            var user = _userRepo.GetById(userId);
            var eventt =  _eventRepo.GetById(eventId);

            if (user == null || eventt == null)
                throw new ArgumentNullException();

            var userEvent = _TicketRepo.GetQueryable()
                .Where(x => x.UserId == userId && x.EventId == eventId).ToList();

            foreach(var rateing in userEvent)
            {

                rateing.Rating = rate;
            await _TicketRepo.update(rateing);
            }

            return true;
        }

        public async Task<bool> Approve(int userId)
        {
            var user = _userRepo.GetById(userId);

            if (user == null) throw new ArgumentNullException("User not found");

            user.isApproved = ApprovalEnums.Approved;
            await _userRepo.update(user);

            return true;
        }

        public async Task<List<UserResponseDTO>> GetAllUsers()
        {
            var users =  _userRepo.GetQueryable().Include(a=>a.Role).Include(a=>a.OrganizedEvents).ToList();
            var mapped= mapper.Map<List<UserResponseDTO>>(users);


            return mapped;
        }

        public async Task<object> GetAnalytics()
        {
            var revenue = _TicketRepo.GetQueryable().Sum(a => a.Quantity * a.TicketPrice);
            var TicketsSold = _TicketRepo.GetQueryable().Sum(a => a.Quantity);
            return new
            {
                Revenue = revenue,
                TicketSold = TicketsSold
            };
        }

        public async Task<List<FavortitesDTO>> GetFavorites(int userId)
        {
            var userEvents = _UsereventRepo.GetQueryable()
                .Where(x => x.UserId == userId && x.IsFavorite)
                .Include(x => x.Event)
                .Where(x=>x.Event.date>DateTime.Now)
                .ToList();
                List<FavortitesDTO> mappedEvents = new List<FavortitesDTO>();

            foreach (var item in userEvents)
            {
                var mapped= mapper.Map<FavortitesDTO>(item);
                mappedEvents.Add(mapped);
                
            }

            return mappedEvents;
        }

        public async Task<bool> DeleteFromFav(int eventid)
        {
            var userid=httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "userid")?.Value;

            var userEvent = _UsereventRepo.GetQueryable()
                .FirstOrDefault(x => x.EventId == eventid&&x.UserId==int.Parse(userid));

            if (userEvent == null)
            {
                throw new Exception("  this event Not in Your Favorite List");
            }
            await _UsereventRepo.delete(userEvent);
            return true;
        }

        public async Task<User> GetUser(int id)
        {
            var user =  _userRepo.GetById(id);
            return user;
        }

        public async Task<bool> DeleteUser(int id)
        {
            var user =  _userRepo.GetById(id);
           await _userRepo.delete(user);
            return true;
        }

        public async Task<bool> RevokeUser(int id)
        {
            var user =  _userRepo.GetById(id);
            user.isApproved = ApprovalEnums.Pending;
            await _userRepo.update(user);
            return true;
        }

        public async Task<bool> RejectUser(int id)
        {
            var user = _userRepo.GetById(id);
            user.isApproved = ApprovalEnums.Rejected;
            await _userRepo.update(user);
            return true;
        }

        public async Task<bool> UpdateUser(int id, UserDTORegister user)
        {
            var user1 =  _userRepo.GetById(id);
            if (user1 == null) throw new ArgumentNullException("User not found");
            mapper.Map(user, user1);
            await _userRepo.update(user1);
            return true;
        }


       
        public async Task<object> Refresh(TokenRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.RefreshToken))
                throw new Exception("Invalid request");

            var storedToken = _RefreshTokenRepo.GetQueryable()
                .FirstOrDefault(x => x.Token == request.RefreshToken);

            if (storedToken == null)
                throw new Exception("Invalid refresh token");

            if (storedToken.IsRevoked)
                throw new Exception("Refresh token revoked");

            if (storedToken.ExpiryDate < DateTime.UtcNow)
                throw new Exception("Refresh token expired");

            var user = _userRepo.GetQueryable()
                .FirstOrDefault(x => x.Id == storedToken.UserId);

            if (user == null)
                throw new Exception("User not found");

      
            storedToken.IsRevoked = true;

        
            var newRefreshToken = new RefreshToken
            {
                Token = RefreshTokenGen.GenerateRefreshToken(),
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

         await  _RefreshTokenRepo.insert(newRefreshToken);


            var newAccessToken = genJwt.genJWT(user);


            return new
            {
                token = newAccessToken,
                refreshToken = newRefreshToken.Token
            };
        }

      public async Task<bool> Booking(int userid, int eventid)
        {
          await  _cartRepo.insert(new Cart
            {
                UserId = userid,
                EventId = eventid
            });
            return true;

        }
    }
}
