using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class TicketsDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int EventId { get; set; }
        public int TicketPrice { get; set; }
        
        public int Quantity { get; set; }

    }
}
