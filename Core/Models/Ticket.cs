using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public int EventId { get; set; }
        [ForeignKey("EventId")]
        public Event Events { get; set; }


        public int UserId { get; set; }
        public User User{ get; set; }
        public int Quantity { get; set; }
        public int TicketPrice { get; set; }
        public int? Rating { get; set; }

        public byte[]? Qr { get; set; }
    }
}
