using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CategoryDTO
    {
        public string Name { get; set; }
    }
    public class CategoryDTOResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
