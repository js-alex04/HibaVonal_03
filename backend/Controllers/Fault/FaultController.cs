using HibaVonal_03.DTOs.Fault;
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


        //Specific operations for Fault
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateFaultStatus(int id, [FromBody] FaultStatusUpdateDto faultStatus)
        {
            var result = await _faultService.UpdateFaultStatusAsync(id, faultStatus);

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
