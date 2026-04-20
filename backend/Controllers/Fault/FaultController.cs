using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Fault;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Fault
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FaultController : ControllerBase
    {
        private readonly IFaultService _faultService;

        public FaultController(IFaultService faultService)
        {
            _faultService = faultService;
        }


        //CRUD operations for Fault
        [HttpPost("{collegiateId}")]
        public async Task<ActionResult> CreateFault(int collegiateId, [FromBody] FaultCreateDto newFault)
        {
            var result = await _faultService.CreateFaultAsync(newFault, collegiateId);

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult> GetAllFaults([FromBody] FaultResponseDto fault)
        {
            var result = await _faultService.GetAllFaultsAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetFaultById(int id)
        {
            var result = await _faultService.GetFaultByIdAsync(id);

            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFault(int id, [FromBody] FaultUpdateDto fault)
        {
            var result = await _faultService.UpdateFaultAsync(id, fault);

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
        public async Task<ActionResult> DeleteFault(int id)
        {
            var result = await _faultService.DeleteFaultAsync(id);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }


        //Specific operations for Fault
        [HttpPost("{id}/add-feedback")]
        public async Task<ActionResult> AddFeedback(int id, [FromBody] FeedbackCreateDto dto)
        {
            var result = await _faultService.NewFeedbackAsync(id, dto);

            if (!result)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpPut("{id}/update-status")]
        public async Task<ActionResult> UpdateFaultStatusAsync(int id, [FromBody] FaultStatusUpdateDto status)
        {
            var result = await _faultService.UpdateFaultStatusAsync(id, status);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPut("{id}/set-maintainer-specialisation")]
        public async Task<ActionResult> SetFaultSpecialisation(int id, [FromBody] int specialisationId)
        {
            var result = await _faultService.SetFaultSpecialisationAsync(id, specialisationId);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPut("{id}/assign-maintainer")]
        public async Task<ActionResult> AssignFaultMaintainer(int id, [FromBody] int maintainerId)
        {
            var result = await _faultService.AssignMaintainerAsync(id, maintainerId);

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
