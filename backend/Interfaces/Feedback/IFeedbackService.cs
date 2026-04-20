using HibaVonal_03.DTOs.Feedback;

namespace HibaVonal_03.Interfaces.Feedback
{
    public interface IFeedbackService
    {
        Task<int> CreateFeedbackAsync(FeedbackCreateDto feedback, int collegiateId);
        Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<FeedbackResponseDto> GetFeedbackByIdAsync(int feedbackId);
        Task<bool> UpdateFeedback(int feedbackId, FeedbackUpdateDto feedback);
        Task<bool> DeleteFeedback(int feedbackId);
    }
}