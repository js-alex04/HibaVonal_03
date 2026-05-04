using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.Interfaces.Auth;
using HibaVonal_03.Interfaces.User;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginRequestDto request)
        {
            var user = await _authService.LoginAsync(request);
            if (user == null) return Unauthorized("Invalid email or password!");
            return Ok(user);
        }
    }
}
