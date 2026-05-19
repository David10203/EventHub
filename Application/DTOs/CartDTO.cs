using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CartDTO
    {
        public int id { get; set; }

        public string Description { get; set; }
        public string Location { get; set; }
        public int TicketPrice { get; set; }

        public string Image { get; set; }
        public string title { get; set; }

        public int AvailableTickets { get; set; }

        public DateTime Date { get; set; }
   
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public string OrganizerId { get; set; }
    }
}
