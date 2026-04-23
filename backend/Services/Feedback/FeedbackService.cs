using AutoMapper;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Interfaces.Feedback;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Feedback
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FeedbackService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // Read
        public async Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAsync(
                null,
                "Collegiate"
            );

            return _mapper.Map<List<FeedbackResponseDto>>(feedbacks);
        }

        // Read by ID
        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(int feedbackId)
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAsync(
                f => f.Id == feedbackId,
                "Collegiate"
            );

            var feedback = feedbacks.FirstOrDefault();

            if (feedback == null)
            {
                return null;
            }

            return _mapper.Map<FeedbackResponseDto>(feedback);
        }

        // Update
        public async Task<bool> UpdateFeedback(int feedbackId, FeedbackUpdateDto feedback)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId);

            if (existingFeedback == null)
            {
                return false;
            }
            else
            {
                existingFeedback.Text = feedback.Text;
                _unitOfWork.FeedbackRepository.Update(existingFeedback);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        // Delete
        public async Task<bool> DeleteFeedback(int feedbackId)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId);

            if (existingFeedback == null)
            {
                return false;
            }
            else
            {
                _unitOfWork.FeedbackRepository.Delete(existingFeedback);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }
    }
}