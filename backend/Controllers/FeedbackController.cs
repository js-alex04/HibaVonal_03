using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Feedback
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<ActionResult> GetAllFeedbacks()
        {
            try
            {
                var result = await _feedbackService.GetAllFeedbacksAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{feedbackId}")]
        [Authorize(Roles = "MaintenanceManager,Administrator")]
        public async Task<ActionResult> GetFeedbackById(int feedbackId)
        {
            try
            {
                var result = await _feedbackService.GetFeedbackByIdAsync(feedbackId);
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

        [HttpPut("{feedbackId}")]
        [Authorize(Roles = "Collegiate")]
        public async Task<ActionResult> UpdateFeedback(int feedbackId, [FromBody] FeedbackUpdateDto feedback)
        {
            try
            {
                var result = await _feedbackService.UpdateFeedbackAsync(feedbackId, feedback);
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

        [HttpDelete("{feedbackId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult> DeleteFeedback(int feedbackId)
        {
            try
            {
                await _feedbackService.DeleteFeedbackAsync(feedbackId);
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