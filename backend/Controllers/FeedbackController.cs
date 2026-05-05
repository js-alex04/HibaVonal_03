using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers.Feedback
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
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