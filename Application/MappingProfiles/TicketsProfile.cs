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
    public class TicketsProfile:Profile
    {
        public TicketsProfile()
        {
            CreateMap<Ticket, TicketsDTO>().ReverseMap();
            CreateMap<Ticket, TicketResponse>().
                ForMember(dest => dest.title, opt => opt.MapFrom(src => src.Events.title))
                .ForMember(dest => dest.date, opt => opt.MapFrom(src => src.Events.date))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Events.Location))
                 .ForMember(dest => dest.QrBytes, opt => opt.MapFrom(src => Convert.ToBase64String(src.Qr)))
                 .ForMember(dest => dest.EventId, opt => opt.MapFrom(src=>src.Events.id))
                
                .ReverseMap();
           
        }

    }
}
