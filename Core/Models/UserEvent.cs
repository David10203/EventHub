using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class UserEvent
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; }

        public bool IsFavorite { get; set; }
        public int? Rating { get; set; }
    }
}
