using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HibaVonal_03.Controllers.Fault
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class FaultController : ControllerBase
    {
        private readonly IFaultService _faultService;

        public FaultController(IFaultService faultService)
        {
            _faultService = faultService;
        }


        //CRUD operations for Fault
        [Authorize(Roles = "Collegiate")]
        [HttpPost("{collegiateId}")]
        public async Task<ActionResult> CreateFault([FromBody] FaultCreateDto newFault)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (!int.TryParse(userIdString, out int loggedInCollegiateId))
                {
                    return Unauthorized("Érvénytelen felhasználói azonosító a tokenben.");
                }

                var result = await _faultService.CreateFaultAsync(newFault, loggedInCollegiateId);

                return CreatedAtAction(nameof(GetFaultById), new { faultId = result.Id }, result);
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

        [HttpGet]
        [Authorize(Roles ="MaintenanceManager,Administrator")]
        public async Task<ActionResult> GetAllFaults()
        {
            try
            {
                var result = await _faultService.GetAllFaultsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{faultId}")]
        public async Task<ActionResult> GetFaultById(int faultId)
        {
            try
            {
                var result = await _faultService.GetFaultByIdAsync(faultId);
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

        [HttpGet("{collegiateId}")]
        [Authorize(Roles = "Collegiate,MaintenanceManager,Administrator")]
        public async Task<ActionResult> GetFaultsByCollegiateId(int collegiateId)
        {
            try
            {
                var result = await _faultService.GetFaultsByCollegiateIdAsync(collegiateId);
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

        [HttpGet("{maintainerId}")]
        [Authorize(Roles = "MaintenanceManager,Maintainer")]
        public async Task<ActionResult> GetFaultsByMaintainerId( int maintainerId)
        {
            try
            {
                var result = await _faultService.GetFaultsByMaintainerIdAsync(maintainerId);
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

        [HttpGet("{status}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<ActionResult> GetFaultsByStatus(FaultStatus status)
        {
            try
            {
                var result = await _faultService.GetFaultsByStatusAsync(status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{faultId}")]
        [Authorize(Roles = "Collegiate,MaintenanceManager")]
        public async Task<ActionResult> UpdateFault(int faultId, [FromBody] FaultUpdateDto fault)
        {
            try
            {
                var result = await _faultService.UpdateFaultAsync(faultId, fault);
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

        [HttpPut("{faultId}/set-maintainer-specialisation")]
        [Authorize(Roles = "MaintenanceManager")]
        public async Task<ActionResult> SetFaultSpecialisation(int faultId, int specialisationId)
        {
            try
            {
                var result = await _faultService.SetFaultSpecialisationAsync(faultId, specialisationId);
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

        [HttpPut("{faultId}/assign-maintainer")]
        [Authorize(Roles = "MaintenanceManager")]
        public async Task<ActionResult> AssignFaultMaintainer(int faultId, int maintainerId)
        {
            try
            {
                var result = await _faultService.AssignMaintainerAsync(faultId, maintainerId);
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

        [HttpPut("{faultId}/update-status")]
        [Authorize(Roles = "MaintenanceManager,Maintainer")]
        public async Task<ActionResult> UpdateFaultStatusAsync(int faultId, FaultStatus status)
        {
            try
            {
                var result = await _faultService.UpdateFaultStatusAsync(faultId, status);
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

        [HttpDelete("{faultId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<ActionResult> DeleteFault(int faultId)
        {
            try
            {
                await _faultService.DeleteFaultAsync(faultId);
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

        //Specific operations for Fault
        [HttpPost("{faultId}/new-feedback")]
        [Authorize(Roles = "Collegiate")]
        public async Task<ActionResult> NewFeedback(int faultId, [FromBody] FeedbackCreateDto dto)
        {
            try
            {
                var result = await _faultService.NewFeedbackAsync(faultId, dto);
                return Ok(result);
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
