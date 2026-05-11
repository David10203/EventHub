using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface ITicketService
    {
        Task<object> ResrvationTicket(int eventid,int numberOfTickets,int userid);
    }
}
