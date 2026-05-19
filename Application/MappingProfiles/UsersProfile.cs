using Application.DTOs;
using AutoMapper;
using Core.Models;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.MappingProfiles
{
    public class UsersProfile:Profile
    {
        public UsersProfile()
        {
            CreateMap<User, UserDTORegister>().ReverseMap();
            CreateMap<User, UserDTOLogin>().ReverseMap();
            CreateMap<User, UserResponseDTO>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FirstName + "" + src.LastName))
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
              
                .ReverseMap();

            CreateMap<UserEvent,FavortitesDTO>().ReverseMap();



        }
    }
}
