using Core.Enums;
using Core.Models;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{

    public class UserDTORegister
    {
        [Required(ErrorMessage = "First name is required")]
        [MinLength(3, ErrorMessage = "First name must be at least 3 characters long")]
        [MaxLength(30, ErrorMessage = "First name must be at most 30 characters long")]
        public string Firstname { get; set; }
        [Required(ErrorMessage = "Last name is required")]
        [MinLength(3, ErrorMessage = "First name must be at least 3 characters long")]
        [MaxLength(30, ErrorMessage = "First name must be at most 30 characters long")]
        public string Lastname { get; set; }
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Password is required")]

        public string Password { get; set; }
        public int RoleId { get; set; }
    }
    public class UserDTOLogin
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Password is required")]

        public string Password { get; set; }

    }

    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string Email { get; set; }
        public string RoleName { get; set; }
        public ApprovalEnums isApproved { get; set; }
        public ICollection<EventResponseAdminDTO> OrganizedEvents { get; set; } = new List<EventResponseAdminDTO>();
        //public ICollection<EventResponseAdminDTO> OrganizedEvents { get; set; } = new List<EventResponseAdminDTO>();

    }

 

    public class FavortitesDTO
    {

        public EventResponseDTO Event { get; set; }
        public bool isfavorite { get; set; } 

    }
}
