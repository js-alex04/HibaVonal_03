using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.DTOs.Collegiate;
using HibaVonal_03.DTOs.Maintainer;
using HibaVonal_03.DTOs.User;
using HibaVonal_03.Interfaces.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.User
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (result == null) return NotFound("Felhasználó nem található.");

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCollegiate([FromBody] CollegiateCreateDto body)
        {
            try
            {
                var result = await _userService.CreateCollegiateAsync(body);
                return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateMaintainer([FromBody] MaintainerCreateDto body)
        {
            try
            {
                var result = await _userService.CreateMaintainerAsync(body);
                return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto body, string role)
        {
            try
            {
                var result = await _userService.CreateManagementAdminAsync(body, role);
                return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromQuery] string newRole)
        {
            try
            {
                var result = await _userService.UpdateUserRoleAsync(id, newRole);
                if (result) return NoContent();

                return NotFound("Felhasználó nem található.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (result) return NoContent();

            return NotFound("Felhasználó nem található.");
        }
    }
}