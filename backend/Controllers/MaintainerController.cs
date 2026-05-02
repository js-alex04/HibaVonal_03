using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.Interfaces.Maintainer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Maintainer
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MaintainerController : ControllerBase
    {
        private readonly IMaintainerService _maintainerService;

        public MaintainerController(IMaintainerService maintainerService)
        {
            _maintainerService = maintainerService;
        }

        // Összes karbantartó listázása
        [HttpGet]
        public async Task<IActionResult> GetAllMaintainers()
        {
            var result = await _maintainerService.GetAllMaintainersAsync();
            return Ok(result);
        }

        // Egy adott karbantartó lekérése ID alapján
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaintainerById(int id)
        {
            var result = await _maintainerService.GetMaintainerByIdAsync(id);
            if (result == null) return NotFound("Karbantartó nem található.");

            return Ok(result);
        }

        // Karbantartók szűrése szakterület (Specialisation) alapján
        [HttpGet("{specialisationId}")]
        public async Task<IActionResult> GetMaintainersBySpecialisationId(int specialisationId)
        {
            var result = await _maintainerService.GetMaintainersBySpecialisationIdAsync(specialisationId);
            return Ok(result);
        }

        // Elérhetőség (betegség, szabadság stb.) módosítása
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAvailability(int id, [FromQuery] bool isAvailable)
        {
            var result = await _maintainerService.UpdateAvailabilityAsync(id, isAvailable);

            if (result) return NoContent();

            return NotFound("Karbantartó nem található.");
        }
    }
}