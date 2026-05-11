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
    public interface IPermissionService
    {
        Task<List<PermissionDTO>> getAllPermissions();
        Task<PermissionDTO> getPermissionById(int id);
        Task<bool> AssginPermissionToRole(int RoleId, List<int> permissionId);
        Task<List<PermissionDTO>> GetPermissionsByRoleid(int Roleid);

    }
}
