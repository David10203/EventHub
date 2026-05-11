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
           
        }

    }
}
