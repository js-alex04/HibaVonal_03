using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Interfaces.Feedback;
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
            var result = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetFeedbackById(int id)
        {
            var result = await _feedbackService.GetFeedbackByIdAsync(id);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFeedback(int id, [FromBody] FeedbackUpdateDto feedback)
        {
            var result = await _feedbackService.UpdateFeedback(id, feedback);

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
        public async Task<ActionResult> DeleteFeedback(int id)
        {
            var result = await _feedbackService.DeleteFeedback(id);

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