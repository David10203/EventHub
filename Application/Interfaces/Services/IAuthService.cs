using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<object> Login(UserDTOLogin request);
        Task<bool> Register(UserDTORegister request);
    }
}
