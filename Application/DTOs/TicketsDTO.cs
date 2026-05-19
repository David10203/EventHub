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

    public class TicketResponse
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public string? QrBytes { get; set; }

        public string Location { get; set; }

        public int? Rating { get; set; }
        public string title { get; set; }

        public DateTime date
        {
            get; set;

        }


    }

    public class ReservationRequest
    {
        public List<ReservationItem> Items { get; set; }
    }

    public class ReservationItem
    {
        public int EventId { get; set; }
        public int NumberOfTickets { get; set; }
    }
}
