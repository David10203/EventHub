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
    public class EventsProfile:Profile
    {
        public EventsProfile()
        {
            CreateMap<EventCreateDTO, Event>()
                  .ForMember(dest => dest.Image, opt => opt.Ignore())          
                  .ForMember(dest => dest.AttachmentData, opt => opt.Ignore());


            CreateMap<Event, EventResponseDTO>()
                 .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Image != null ? Convert.ToBase64String(src.Image) : null))
                .ForMember(dest => dest.OrganizerName, opt => opt.MapFrom(src => src.User.FirstName));

            CreateMap<Event, EventResponseAdminDTO>()
                    .ForMember(dest => dest.Image,opt => opt.MapFrom(src =>src.Image != null ? Convert.ToBase64String(src.Image) : null));

            CreateMap<Event, CartDTO>().ReverseMap();

        }
    }
}
