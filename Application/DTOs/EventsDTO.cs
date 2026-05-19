using Core.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class EventCreateDTO
    {

        public string Description { get; set; }
        public string Location { get; set; }
        public int TicketPrice { get; set; }
        public string title { get; set; }


        public int NumberOfTickets { get; set; }
        public IFormFile? Image { get; set; }
        public int CategoryId { get; set; }

        public IFormFile? Attachment { get; set; }
        public DateTime Date { get; set; }
    }


    public class EventResponseDTO
    {
        public int id { get; set; }

        public string Description { get; set; }
        public string Location { get; set; }
        public int TicketPrice { get; set; }
        public int NumberOfTickets { get; set; }

        public string title { get; set; }

        public int AvailableTickets { get; set; }

        public DateTime Date { get; set; }
        public string OrganizerName { get; set; }
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public int OrganizerId { get; set; }

        public string? Image { get; set; }


        public ApprovalEnums IsAccepted { get; set; }=ApprovalEnums.Pending;
        public byte[]? AttachmentData { get; set; }


        public string? AttachmentFileName { get; set; }
        public string? AttachmentContentType { get; set; }

    }



    public class EventResponseAdminDTO
    {
        public string? Image { get; set; }
        public string title { get; set; }
        public enum IsAccepted { Pending, Approved, Rejected };
        public DateTime Date { get; set; }
    }

}
