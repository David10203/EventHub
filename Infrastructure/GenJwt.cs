using Core.AuthModel;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class GenJwt
    {
        private GenericRepo<Role> _RoleRepo;
        private GenericRepo<User> _UserRepo;
        private GenericRepo<Permission> _PermissionRepo;
        private JWT _jwt;
        public GenJwt( GenericRepo<Role>  repo, GenericRepo<User> userRepo, IOptions<JWT> jwt, GenericRepo<Permission> PermissionRepo)
        {
            _jwt = jwt.Value;
            _PermissionRepo = PermissionRepo;
            _UserRepo = userRepo;
            _RoleRepo = repo;
            
        }
        public    string genJWT(User user)
        {
            var Role = user.RoleId;
            var userRole = _RoleRepo.GetById(Role);
            var handler = new JwtSecurityTokenHandler();

            var claims = new List<Claim>
            {
                new Claim("name",user.FirstName),
                new Claim("userid", user.Id.ToString()),
                new Claim("E-mail", user.Email),
                new Claim("role", userRole.Name.ToString())
            };
        
              
            var rolper = _PermissionRepo
             .GetQueryable()
             .Where(a => a.Roles.Any(s => s.Name == user.Role.Name))
             .ToList();

            foreach (var permission in rolper)
            {
                claims.Add(new Claim("permission", permission.Name));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_jwt.Key)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                 issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
              expires: DateTime.UtcNow.AddMinutes(_jwt.DurationinMinutes),
                signingCredentials: creds
            );
            var token = handler.WriteToken(tokenDescriptor);
            return token;
        }
    }
}
