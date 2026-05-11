using Application.DTOs;
using Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IRoleService
    {
    
        Task<List<RolesDTOResponse>> GetRoles();
   
        Task<RolesDTOResponse> GetRole(int id);

  
    }
}
