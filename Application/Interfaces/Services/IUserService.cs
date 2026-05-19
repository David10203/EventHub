using Application.DTOs;
using Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
   public interface  IUserService
    {
        //Task <bool> register(UserDTORegister users);
        //Task<object> Login(UserDTOLogin request);

        Task<object> Refresh(TokenRequest request);
        Task<bool> Approve(int userId);
        Task<List<FavortitesDTO>> GetFavorites(int userId);
        Task<bool> AddEventToFavorite(int eventId, int userId);
        Task<User> GetUser(int id);
        Task<bool> DeleteUser(int id);

        Task<bool> RejectUser(int id);
        Task<bool> UpdateUser(int id, UserDTORegister user);

        Task<bool> Booking( int userId, int eventId);
        Task<bool> AddRate(int userId, int eventId, int rate);
        //Task<IActionResult> RemoveEventFromFavorite(int eventId, int userId);

        Task<List<UserResponseDTO>> GetAllUsers();

        Task<bool> DeleteFromFav(int eventid);
        Task<bool> RevokeUser(int id);

        Task<object> GetAnalytics();
    }
}
