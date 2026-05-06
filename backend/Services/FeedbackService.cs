using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services
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
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAsync(null, "Collegiate");

            return _mapper.Map<List<FeedbackResponseDto>>(feedbacks);
        }

        // Read by ID
        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(int feedbackId)
        {
            var feedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId, "Collegiate")
                ?? throw new KeyNotFoundException($"A visszajelzés a megadott azonosítóval ({feedbackId}) nem található.");

            return _mapper.Map<FeedbackResponseDto>(feedback);
        }

        // Update
        public async Task<FeedbackResponseDto> UpdateFeedbackAsync(int feedbackId, FeedbackUpdateDto feedback)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId)
                ?? throw new KeyNotFoundException($"A visszajelzés a megadott azonosítóval ({feedbackId}) nem található.");

            _mapper.Map(feedback, existingFeedback);
            
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<FeedbackResponseDto>(existingFeedback);
        }

        // Delete
        public async Task DeleteFeedbackAsync(int feedbackId)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId)
                ?? throw new KeyNotFoundException($"A visszajelzés a megadott azonosítóval ({feedbackId}) nem található.");

            _unitOfWork.FeedbackRepository.Delete(existingFeedback);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}