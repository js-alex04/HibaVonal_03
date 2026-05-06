using HibaVonal_03.DTOs;

namespace HibaVonal_03.Interfaces
{
    public interface IFeedbackService
    {
        Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<FeedbackResponseDto?> GetFeedbackByIdAsync(int feedbackId);
        Task<FeedbackResponseDto> UpdateFeedbackAsync(int feedbackId, FeedbackUpdateDto feedback);
        Task DeleteFeedbackAsync(int feedbackId);
    }
}