using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Premise
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class PremiseController : ControllerBase
    {
        private readonly IPremiseService _premiseService;

        public PremiseController(IPremiseService premiseService)
        {
            _premiseService = premiseService;
        }

        // Create
        [HttpPost]
        [Authorize(Roles ="Administrator")]
        public async Task<IActionResult> CreatePremise([FromBody] PremiseCreateDto body)
        {
            try
            {
                var result = await _premiseService.CreatePremiseAsync(body);
                return CreatedAtAction(nameof(GetPremiseById), new { premiseId = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllPremises()
        {
            try
            {
                var result = await _premiseService.GetAllPremisesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Read by ID
        [HttpGet("{premiseId}")]
        public async Task<IActionResult> GetPremiseById(int premiseId)
        {
            try
            {
                var result = await _premiseService.GetPremiseByIdAsync(premiseId);
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
        [HttpPut("{premiseId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdatePremise(int premiseId, [FromBody] PremiseUpdateDto body)
        {
            try
            {
                var result = await _premiseService.UpdatePremiseAsync(premiseId, body);
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
        [HttpDelete("{premiseId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeletePremise(int premiseId)
        {
            try
            {
                await _premiseService.DeletePremiseAsync(premiseId);
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

        // Specific operations
        [HttpPut("{premiseId}/add-appliance/{applianceId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> AddApplianceToPremise(int premiseId, int applianceId)
        {
            try
            {
                var result = await _premiseService.AddApplianceToPremiseAsync(premiseId, applianceId);
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

        [HttpPut("{premiseId}/remove-appliance/{applianceId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteApplianceFromPremise(int premiseId, int applianceId)
        {
            try
            {
                await _premiseService.DeleteApplianceFromPremiseAsync(premiseId, applianceId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
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
    }
}
