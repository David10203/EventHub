using Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class RolesDTORequst
    {
        public string Name { get; set; }
    }
    public class RolesDTOResponse : RolesDTORequst
    {
        public int Id { get; set; }
       public ICollection<PermissionDTO> Permissions { get; set; } = new List<PermissionDTO>();
    }
}
