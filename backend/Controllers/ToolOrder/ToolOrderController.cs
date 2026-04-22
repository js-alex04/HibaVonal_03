using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Interfaces.ToolOrder;
using HibaVonal_03.Services.ToolOrder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.ToolOrder
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ToolOrderController : ControllerBase
    {
        private readonly IToolOrderService _toolOrderService;

        public ToolOrderController(IToolOrderService toolOrderService)
        {
            _toolOrderService = toolOrderService;
        }


        // CRUD négy alapművelet a ToolOrder entitásra
        // Create
        [HttpPost]
        public async Task<IActionResult> CreateToolOrder([FromBody] ToolOrderCreateDto body)
        {
            var result = await _toolOrderService.CreateToolOrderAsync(body);

            return CreatedAtAction(nameof(GetToolOrderById), new { id = result.Id }, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var result = await _toolOrderService.GetAllToolOrdersAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetToolOrderById(int id)
        {
            var result = await _toolOrderService.GetToolOrderByIdAsync(id);

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
        public async Task<IActionResult> UpdateToolOrder(int id, [FromBody] ToolOrderUpdateDto body)
        {
            var result = await _toolOrderService.UpdateToolOrderAsync(id, body);

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
        public async Task<IActionResult> DeleteToolOrder(int id)
        {
            var result = await _toolOrderService.DeleteToolOrderAsync(id);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }


        //Specific operations for ToolOrder
        [HttpPut("{id}/delivery-status")]
        public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromBody] bool isDelivered)
        {
            var result = await _toolOrderService.UpdateDeliveryStatusAsync(id, isDelivered);

            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpGet("fault/{faultId}")]
        public async Task<IActionResult> GetToolOrdersByFaultId(int faultId)
        {
            var result = await _toolOrderService.GetToolOrdersByFaultIdAsync(faultId);

            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var result = await _toolOrderService.GetPendingOrdersAsync();

            return Ok(result);
        }
    }
}
