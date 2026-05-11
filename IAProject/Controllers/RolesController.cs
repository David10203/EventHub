using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IAProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : Controller
    {

        private IRoleService _roleService;
        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public Task<List<RolesDTOResponse>> GetRoles()
        {
            return _roleService.GetRoles();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<RolesDTOResponse> GetRole(int id)
        {
            return await _roleService.GetRole(id);
        }


    }
}
