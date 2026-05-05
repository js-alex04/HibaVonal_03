using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.MaintainerSpecialisation
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MaintainerSpecialisationController : ControllerBase
    {
        private readonly IMaintainerSpecialisationService _maintainerSpecialisationService;

        public MaintainerSpecialisationController(IMaintainerSpecialisationService maintainerSpecialisationService)
        {
            _maintainerSpecialisationService = maintainerSpecialisationService;
        }

        // Create
        [HttpPost]
        public async Task<IActionResult> CreateMaintainerSpecialisation([FromBody] MaintainerSpecialisationCreateDto body)
        {
            try
            {
                var result = await _maintainerSpecialisationService.CreateMaintainerSpecialisationAsync(body);
                return CreatedAtAction(nameof(GetMaintainerSpecialisationById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllMaintainerSpecialisations()
        {
            try
            {
                var result = await _maintainerSpecialisationService.GetAllMaintainerSpecialisationsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Read by ID
        [HttpGet("{maintainerSpecialisationId}")]
        public async Task<IActionResult> GetMaintainerSpecialisationById(int maintainerSpecialisationId)
        {
            try
            {
                var result = await _maintainerSpecialisationService.GetMaintainerSpecialisationByIdAsync(maintainerSpecialisationId);
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

        [HttpGet("maintainer/{maintainerId}")]
        public async Task<IActionResult> GetSpecialisationsByMaintainerId(int maintainerId)
        {
            try
            {
                var result = await _maintainerSpecialisationService.GetSpecialisationsByMaintainerIdAsync(maintainerId);
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

        // Update
        [HttpPut("{maintainerSpecialisationId}")]
        public async Task<IActionResult> UpdateMaintainerSpecialisation(int maintainerSpecialisationId, [FromBody] MaintainerSpecialisationUpdateDto body)
        {
            try
            {
                var result = await _maintainerSpecialisationService.UpdateMaintainerSpecialisationAsync(maintainerSpecialisationId, body);
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
        [HttpDelete("{maintainerSpecialisationId}")]
        public async Task<IActionResult> DeleteMaintainerSpecialisation(int maintainerSpecialisationId)
        {
            try
            {
                await _maintainerSpecialisationService.DeleteMaintainerSpecialisationAsync(maintainerSpecialisationId);
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
