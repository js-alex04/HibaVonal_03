using HibaVonal_03.DTOs.Premise;
using HibaVonal_03.Interfaces.Premise;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Premise
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class PremiseController : ControllerBase
    {
        private readonly IPremiseService _premiseService;

        public PremiseController(IPremiseService premiseService)
        {
            _premiseService = premiseService;
        }

        // CRUD négy alapművelet a Premise entitásra
        // Create
        [HttpPost]
        public async Task<IActionResult> CreatePremise([FromBody] PremiseCreateDto body)
        {
            var result = await _premiseService.CreatePremiseAsync(body);

            return CreatedAtAction(nameof(GetPremiseById), new { id = result.Id }, result);
        }

        // Read
        [HttpGet]
        public async Task<IActionResult> GetAllPremises()
        {
            var result = await _premiseService.GetAllPremisesAsync();

            return Ok(result);
        }

        // Read by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPremiseById(int id)
        {
            var result = await _premiseService.GetPremiseByIdAsync(id);

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
        public async Task<IActionResult> UpdatePremise(int id, [FromBody] PremiseUpdateDto body)
        {
            var result = await _premiseService.UpdatePremiseAsync(id, body);

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
        public async Task<IActionResult> DeletePremise(int id)
        {
            var result = await _premiseService.DeletePremiseAsync(id);

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
