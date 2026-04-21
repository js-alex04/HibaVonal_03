using HibaVonal_03.Interfaces.Premise;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace HibaVonal_03.Controllers.Premise
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    internal class PremiseController: ControllerBase
    {
        private readonly IPremiseService _premiseService;
        public PremiseController(IPremiseService premiseService)
        {
            _premiseService = premiseService;
        }
        [HttpPost]
        public async Task<IActionResult> CreatePremise([FromBody] PremiseCreateDto body) {

            var result = await _premiseService.CreatePremiseAsync(body);

            return CreatedAtAction(nameof(GetPremiseById), new { id = result.Id }, result);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _premiseService.GetAllPremiseAsync();

            return Ok(result);
        }
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
