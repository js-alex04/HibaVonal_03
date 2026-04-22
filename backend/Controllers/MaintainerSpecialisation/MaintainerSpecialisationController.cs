using HibaVonal_03.DTOs.MaintainerSpecialisation;
using HibaVonal_03.Interfaces.MaintainerSpecialisation;
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

        // CRUD négy alapművelet a MaintainerSpecialisation entitásra
        // Create
        [HttpPost]
        public async Task<IActionResult> CreateMaintainerSpecialisation([FromBody] MaintainerSpecialisationCreateDto body)
        {
            var result = await _maintainerSpecialisationService.CreateMaintainerSpecialisationAsync(body);

            return CreatedAtAction(nameof(GetMaintainerSpecialisationById), new { id = result.Id }, result);
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllMaintainerSpecialisations()
        {
            var result = await _maintainerSpecialisationService.GetAllMaintainerSpecialisationsAsync();

            return Ok(result);
        }

        // Read by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaintainerSpecialisationById(int id)
        {
            var result = await _maintainerSpecialisationService.GetMaintainerSpecialisationByIdAsync(id);

            if (result == null)
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

        // Delete
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
