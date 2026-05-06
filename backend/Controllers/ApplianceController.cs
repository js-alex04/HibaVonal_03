using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Appliance
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class ApplianceController : ControllerBase
    {
        private readonly IApplianceService _applianceService;

        public ApplianceController(IApplianceService applianceService)
        {
            _applianceService = applianceService;
        }

        // Create
        [HttpPost]
        [Authorize(Roles ="Administrator")]
        public async Task<IActionResult> CreateAppliance([FromBody] ApplianceCreateDto body)
        {
            try
            {
                var result = await _applianceService.CreateApplianceAsync(body);
                return CreatedAtAction(nameof(GetApplianceById), new { id = result.Id }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllAppliances()
        {
            try
            {
                var result = await _applianceService.GetAllAppliancesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Read by ID
        [HttpGet("{applianceId}")]
        public async Task<IActionResult> GetApplianceById(int applianceId)
        {
            try
            {
                var result = await _applianceService.GetApplianceByIdAsync(applianceId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Update
        [HttpPut("{applianceId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdateAppliance(int applianceId, [FromBody] ApplianceUpdateDto body)
        {
            try
            {
                var result = await _applianceService.UpdateApplianceAsync(applianceId, body);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Delete
        [HttpDelete("{applianceId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteAppliance(int applianceId)
        {
            try
            {
                await _applianceService.DeleteApplianceAsync(applianceId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
