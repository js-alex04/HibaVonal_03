using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Interfaces.Fault;
using HibaVonal_03.Interfaces.Feedback;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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

        //CRUM operations for Feedback
        [HttpPost("{collegiateId}")]
        public async Task<ActionResult> CreateFault(int collegiateId, [FromBody] FeedbackCreateDto newFeedback)
        {
            var result = await _feedbackService.CreateFeedbackAsync(newFeedback, collegiateId);

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult> GetAllFaults()
        {
            var result = await _feedbackService.GetAllFeedbacksAsync();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetAllFaults(int id)
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
            }else
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
