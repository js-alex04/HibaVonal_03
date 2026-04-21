using HibaVonal_03.Interfaces.Appliance;
using HibaVonal_03.Interfaces.MaintainerSpecialisation;
using HibaVonal_03.Services.Appliance;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace HibaVonal_03.Controllers.MaintainerSpecialisation
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    internal class MaintainerSpecialisationController: ControllerBase
    {
        private readonly IMaintainerSpecialisationService _maintainerSpecialisationService;

        public MaintainerSpecialisationController(IMaintainerSpecialisationService maintainerSpecialisation)
        {
            _maintainerSpecialisationService = maintainerSpecialisation;
        }
        [HttpPost]
        public async Task<IActionResult> CreateMaintainerSpecialisation([FromBody] MaintainerSpecialisationCreateDto body)
        {
            var result = await _maintainerSpecialisationService.CreateMaintainerSpecialisationAsync(body);

            return CreatedAtAction(nameof(GetMaintainerSpecialisationById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _maintainerSpecialisationService.GetAllMaintainerSpecialisationAsync();

            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaintainerSpecialisationById(int id)
        {
            var result = await _maintainerSpecialisationService.GetMaintainerSpecialisationByIdAsync(id);

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
        public async Task<IActionResult> UpdateMaintainerSpecialisation(int id, [FromBody] MaintainerSpecialisationUpdateDto body)
        {
            var result = await _maintainerSpecialisationService.UpdateMaintainerSpecialisationAsync(id, body);

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
        public async Task<IActionResult> DeleteMaintainerSpecialisation(int id)
        {
            var result = await _maintainerSpecialisationService.DeleteMaintainerSpecialisationAsync(id);

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
