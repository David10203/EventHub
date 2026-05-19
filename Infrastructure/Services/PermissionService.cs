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
    public class PermissionService : IPermissionService
    {
        private GenericRepo<Permission> _PermissionRepo;
        private GenericRepo<User> _UserRepo;
        private GenericRepo<Role> _RoleRepo;
        private IMapper _Mapper;
        public PermissionService( GenericRepo<Permission> PermissionRepo, GenericRepo<User> userRepo, GenericRepo<Role> roleRepo, IMapper mapper)
        {

            _PermissionRepo = PermissionRepo;
            _UserRepo = userRepo;
            _RoleRepo = roleRepo;
            _Mapper = mapper;
        }



        public async Task<bool> AssginPermissionToRole(int RoleId, List<int> permissions)
        {
            var role = _RoleRepo
        .GetQueryable()
        .Include(u => u.Permissions)
        .FirstOrDefault(u => u.Id == RoleId);

            if (role == null)
                throw new ArgumentNullException("Role not found");

            var allper = _PermissionRepo
                .GetQueryable()
                .Where(a => permissions.Contains(a.Id))
                .ToList();

            role.Permissions.Clear();

            foreach (var per in allper)
            {
                role.Permissions.Add(per);
            }

           await _RoleRepo.update(role);

            return true;
        }

        public async Task<List<PermissionDTO>> getAllPermissions()
        {
            var Permissions1 = _PermissionRepo.GetQueryable().ToList();
            var mapped= _Mapper.Map<List<PermissionDTO>>(Permissions1);
            return mapped;
        }

        public async Task<PermissionDTO> getPermissionById(int id)
        {
            var Permissions1 = _PermissionRepo.GetById(id);
            var mapped= _Mapper.Map<PermissionDTO>(Permissions1);
            return mapped;
        }

        public async Task<List<PermissionDTO>> GetPermissionsByRoleid(int Roleid)
        {
           var Role = _RoleRepo.GetQueryable().Include(a=>a.Permissions).FirstOrDefault(a => a.Id == Roleid);
            var Mapped= _Mapper.Map<List<PermissionDTO>>(Role.Permissions.ToList());
            return Mapped ;
     ;
        }


    }
}
