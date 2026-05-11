using Application.DTOs;
using Application.Interfaces.Services;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace IAProject.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    public class Permissions : Controller
    {
        private IPermissionService _PermissionService;
        public Permissions(IPermissionService PermissionService)
        {
            _PermissionService = PermissionService;
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("getAllPermissions")]
        public  Task<List<PermissionDTO>> getAllPermissions()
        {
            return _PermissionService.getAllPermissions();
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("getPermission/{id}")]
        public async Task<PermissionDTO> GetPermission(int id)
        {
            return await _PermissionService.getPermissionById(id);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getPermissionsByRoleid/{Roleid}")]
        public async Task<List<PermissionDTO>> GetPermissionsByRoleid(int Roleid)
        {
            return await _PermissionService.GetPermissionsByRoleid(Roleid);
        }
        [Authorize(Roles ="Admin")]
        [HttpPost("AssignPermissionToRole/{Roleid}")]
        public  async Task<IActionResult> AssignPermissionToRole(int Roleid, List<int> permissions)
        {
            await _PermissionService.AssginPermissionToRole(Roleid, permissions);

            return Ok(new {message="success"});
        }
    }
}
