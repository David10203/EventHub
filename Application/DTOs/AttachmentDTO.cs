using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AttachmentDTO
    {
        public byte[] Data { get; set; }
        public string ContentType { get; set; }
        public string FileName { get; set; }
    }
}
