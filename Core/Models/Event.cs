using Core.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class Event
    {
        [Key]
        public int id { get; set; }

        public string description { get; set; }
        public string Location { get; set; }
        public string title { get; set; }
        public int NumberOfTickets { get; set; }
        public int AvailableTickets { get; set; }


        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Category Category { get; set; }
        public ApprovalEnums isAccepted { get; set; }= ApprovalEnums.Pending;
        public DateTime date
        {
            get; set;

        }
        public int OrganizerId { get; set; }

        [ForeignKey("OrganizerId")]
        public User User { get; set; }
        public int TicketPrice { get; set; }

        public byte[]? Image { get; set; }




        public byte[]? AttachmentData { get; set; }


        public string? AttachmentFileName { get; set; }
        public string? AttachmentContentType { get; set; }
    }
}
