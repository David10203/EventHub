using Application.DTOs;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace IAProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private IAuthService authService;
        public AuthController( IAuthService authService)
        {
            this.authService = authService;
            
        }


        [HttpPost("register")]
        public async Task<IActionResult> register(UserDTORegister users)
        {
            await authService.Register(users);
            return Ok(new { message = "User registered" });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDTOLogin request)
        {
            try
            {

                var response = await authService.Login(request);
                return Ok(response);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }
    }
}
