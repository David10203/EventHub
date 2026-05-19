using Application.DTOs;
using Application.Interfaces.Services;
using AutoMapper;
using Core.Enums;
using Core.Interfaces;
using Core.Methods;
using Core.Models;
using Infrastructure.Repos;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class AuthService: IAuthService
    {
        private GenericRepo<User> _userRepo;
        private GenJwt genJwt;
        private readonly GenericRepo<RefreshToken> _RefreshTokenRepo;
        private IMapper _mapper;
        public AuthService( GenericRepo<User> userRepo , GenericRepo<RefreshToken> refreshTokenRepo, GenJwt genJwt, IMapper mapper)
        {
            _mapper = mapper;
            _userRepo = userRepo;
            
            _RefreshTokenRepo = refreshTokenRepo;
            this.genJwt = genJwt;
        }

        public async Task<object> Login(UserDTOLogin request)
        {

            var check = _userRepo.GetQueryable().Where(s => s.Email == request.Email).FirstOrDefault();

            if (check == null)
            {
                throw new ValidationException("inccorect email or password");
            }
            if (new PasswordHasher<UserDTOLogin>().VerifyHashedPassword(request, check.Password, request.Password) == PasswordVerificationResult.Failed)
            {
                throw new ValidationException("inccorect email or password");
            }
            if (check.isApproved==ApprovalEnums.Pending)
            {
                throw new Exception("Wait for Admin Approval");
            }
            if (check.isApproved == ApprovalEnums.Rejected)
            {
                throw new Exception("Contact Help Center ,Your Account is Rejected");
            }


            var token = genJwt.genJWT(check);
            var refreshToken = RefreshTokenGen.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                UserId = check.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            await _RefreshTokenRepo.insert(refreshTokenEntity);



            return new
            {
                token = token,
                refreshToken = refreshToken

            };
        }

        public async Task<bool> Register(UserDTORegister users)
        {

            string pattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$";
            Regex regex = new Regex(pattern);

            bool isValid = regex.IsMatch(users.Password);
            if (!isValid)
            {
                throw new ValidationException("invaild password must have upper case\n lowercase\nspie  char\n");
            }
            if (_userRepo.GetQueryable().Any(s => s.Email == users.Email)!)
            {
                throw new ValidationException("User already exists");
            }


            var newuser = _mapper.Map<User>(users);
            var hasher = new PasswordHasher<User>();

            newuser.Password = hasher.HashPassword(newuser, users.Password);


            if (users.RoleId == 2)
            {
                newuser.isApproved = ApprovalEnums.Pending;
            }
            else
            {
                newuser.isApproved = ApprovalEnums.Approved;
            }

            var result = _userRepo.insert(newuser);

            return true;
        }

  
    }
}
