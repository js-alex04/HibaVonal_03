using HibaVonal_03.Interfaces;
using HibaVonal_03.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Maintainer
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class MaintainerController : ControllerBase
    {
        private readonly IMaintainerService _maintainerService;

        public MaintainerController(IMaintainerService maintainerService)
        {
            _maintainerService = maintainerService;
        }

        // Összes karbantartó listázása
        [HttpGet]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetAllMaintainers()
        {
            try
            {
                var result = await _maintainerService.GetAllMaintainersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Egy adott karbantartó lekérése ID alapján
        [HttpGet("{maintainerId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetMaintainerById(int maintainerId)
        {
            try
            {
                var result = await _maintainerService.GetMaintainerByIdAsync(maintainerId);
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

        // Karbantartók szűrése szakterület (Specialisation) alapján
        [HttpGet("{specialisationId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetMaintainersBySpecialisationId(int specialisationId)
        {
            try
            {
                var result = await _maintainerService.GetMaintainersBySpecialisationIdAsync(specialisationId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Karbantartó szakterületeinek módosítása
        [HttpPut("{maintainerId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdateMaintainerSpecialisations(int maintainerId, [FromBody] List<int> specialisationIds)
        {
            try
            {
                await _maintainerService.UpdateMaintainerSpecialisationsAsync(maintainerId, specialisationIds);
                return Ok();
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


        // Elérhetőség (betegség, szabadság stb.) módosítása
        [HttpPut("{maintainerId}")]
        [Authorize(Roles = "MaintenanceManager,Maintainer")]
        public async Task<IActionResult> UpdateAvailability(int maintainerId, [FromQuery] bool isAvailable)
        {
            try
            {
                var result = await _maintainerService.UpdateAvailabilityAsync(maintainerId, isAvailable);
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