using Application.DTOs;
using AutoMapper;
using Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.MappingProfiles
{
    public class RolesProfile:Profile
    {
        public RolesProfile()
        {
            CreateMap<Role, RolesDTORequst>().ReverseMap();
            CreateMap<Role, RolesDTOResponse>()
      .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.Permissions)).ReverseMap();
            CreateMap<Permission, PermissionDTO>();
            CreateMap<Role, PermissionDTO>().ReverseMap();
         
              


        }
    }
}
