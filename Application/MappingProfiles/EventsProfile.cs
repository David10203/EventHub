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
            CreateMap<Event,EventCreateDTO >().ReverseMap();
            CreateMap<Event, EventResponseDTO>()
                .ForMember(dest => dest.OrganizerName, opt => opt.MapFrom(src => src.User.FirstName))
           .ReverseMap();

            CreateMap<Event, EventResponseAdminDTO>();

        }
    }
}
