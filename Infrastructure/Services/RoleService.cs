using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class RoleService : IRoleService
    {
        private readonly GenericRepo<Role> _RoleRepo;
        private readonly IMapper _Mapper;
        public RoleService( GenericRepo<Role> RoleRepo, IMapper mapper)
        {
            _RoleRepo = RoleRepo;
            _Mapper = mapper;
            
        }
 



        public async Task<RolesDTOResponse> GetRole(int id)
        {
            var test = _RoleRepo.GetQueryable().Include(a=>a.Permissions).FirstOrDefault(a => a.Id == id);
            var mapped = _Mapper.Map<RolesDTOResponse>(test);
            return mapped;
        }

        public async Task<List<RolesDTOResponse>> GetRoles()
        {
            var Events = _RoleRepo.GetQueryable().Include(a => a.Permissions).ToList();
            var mapped= _Mapper.Map<List<RolesDTOResponse>>(Events);
            return mapped;
        }


    }
}
