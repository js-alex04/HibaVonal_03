using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Interfaces.Appliance;
using HibaVonal_03.Interfaces.ToolOrder;
using HibaVonal_03.Services.ToolOrder;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

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

        [HttpPost]
        public async Task<IActionResult> CreateAppliance([FromBody] ApplianceCreateDto body)
        {
            var result = await _applianceService.CreateAppilanceAsync(body);

            return CreatedAtAction(nameof(GetApplianceById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAppliance()
        {
            var result = await _applianceService.GetAllApplianceAsync();

            return Ok(result);
        }
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
