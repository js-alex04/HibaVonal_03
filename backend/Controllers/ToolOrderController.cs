using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.ToolOrder
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class ToolOrderController : ControllerBase
    {
        private readonly IToolOrderService _toolOrderService;

        public ToolOrderController(IToolOrderService toolOrderService)
        {
            _toolOrderService = toolOrderService;
        }

        // Create
        [HttpPost("{faultId}")]
        [Authorize(Roles = "MaintenanceManager,Maintainer")]
        public async Task<IActionResult> CreateToolOrder(int faultId, [FromBody] ToolOrderCreateDto body)
        {
            try
            {
                var result = await _toolOrderService.CreateToolOrderAsync(faultId, body);
                return CreatedAtAction(nameof(GetToolOrderById), new { toolOrderId = result.Id }, result);
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

        [HttpGet]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetAllToolOrders()
        {
            try
            {
                var result = await _toolOrderService.GetAllToolOrdersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{toolOrderId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetToolOrderById(int toolOrderId)
        {
            try
            {
                var result = await _toolOrderService.GetToolOrderByIdAsync(toolOrderId);
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

        [HttpGet("fault/{faultId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetToolOrdersByFaultId(int faultId)
        {
            try
            {
                var result = await _toolOrderService.GetToolOrdersByFaultIdAsync(faultId);
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
        [Authorize(Roles = "Maintainer,MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetToolOrdersByMaintainerId(int maintainerId)
        {
            try
            {
                var result = await _toolOrderService.GetToolOrdersByMaintainerIdAsync(maintainerId);
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

        [HttpGet("pending")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<IActionResult> GetPendingToolOrders()
        {
            try
            {
                var result = await _toolOrderService.GetPendingToolOrdersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{toolOrderId}/delivery-status")]
        [Authorize(Roles = "MaintenanceManager")]
        public async Task<IActionResult> UpdateDeliveryStatus(int toolOrderId, bool isDelivered)
        {
            try
            {
                var result = await _toolOrderService.UpdateDeliveryStatusAsync(toolOrderId, isDelivered);
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

        [HttpDelete("{toolOrderId}")]
        [Authorize(Roles = "MaintenanceManager")]
        public async Task<IActionResult> DeleteToolOrder(int toolOrderId)
        {
            try
            {
                await _toolOrderService.DeleteToolOrderAsync(toolOrderId);
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
