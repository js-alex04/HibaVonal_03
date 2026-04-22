using HibaVonal_03.DTOs.Appliance;
using HibaVonal_03.Interfaces.Appliance;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Appliance
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ApplianceController : ControllerBase
    {
        private readonly IApplianceService _applianceService;

        public ApplianceController(IApplianceService applianceService)
        {
            _applianceService = applianceService;
        }

        // CRUD négy alapművelet a Appliance entitásra
        // Create
        [HttpPost]
        public async Task<IActionResult> CreateAppliance([FromBody] ApplianceCreateDto body)
        {
            var result = await _applianceService.CreateApplianceAsync(body);

            return CreatedAtAction(nameof(GetApplianceById), new { id = result.Id }, result);
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllAppliances()
        {
            var result = await _applianceService.GetAllAppliancesAsync();

            return Ok(result);
        }

        // Read by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetApplianceById(int id)
        {
            var result = await _applianceService.GetApplianceByIdAsync(id);

            if (result is null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        // Update
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppliance(int id, [FromBody] ApplianceUpdateDto body)
        {
            var result = await _applianceService.UpdateApplianceAsync(id, body);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        // Delete
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppliance(int id)
        {
            var result = await _applianceService.DeleteApplianceAsync(id);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
