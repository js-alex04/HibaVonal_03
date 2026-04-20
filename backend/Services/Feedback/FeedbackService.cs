using AutoMapper;
using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Feedback;
using HibaVonal_03.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;

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

        //CRUD operations for Feedback
        //Create
        public async Task<int> CreateFeedbackAsync(FeedbackCreateDto feedback, int collegiateId)
        {
            var fault = await _unitOfWork.FaultRepository.GetByIdAsync(feedback.FaultId);
            if (fault == null)
            {
                throw new ArgumentException($"Fault with ID {feedback.FaultId} does not exist.");
            }
            else if (fault.Status is not FaultStatus.Repaired)
            {
                throw new ArgumentException($"Fault with ID {feedback.FaultId} is not yet finished");
            }

            var newFeedback = new Entities.Feedback
            {
                FaultId = feedback.FaultId,
                Date = DateTime.UtcNow,
                Text = feedback.Text,
                CollegiateId = collegiateId,
            };

            await _unitOfWork.FeedbackRepository.AddAsync(newFeedback);
            await _unitOfWork.SaveChangesAsync();

            return newFeedback.Id;
        }

        //Read
        public async Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAsync(
                null,
                "Collegiate"
                );

            return _mapper.Map<List<FeedbackResponseDto>>(feedbacks);
        }

        public async Task<FeedbackResponseDto> GetFeedbackByIdAsync(int feedbackId)
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAsync(
                f => f.Id == feedbackId,
                "Collegiate"
                );

            return _mapper.Map<FeedbackResponseDto>(feedbacks);
        }

        //Update
        public async Task<bool> UpdateFeedback(int feedbackId, FeedbackUpdateDto feedback)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId);

            if (existingFeedback == null)
            {
                return false;
            }else
            {
                existingFeedback.Text = feedback.Text;
                _unitOfWork.FeedbackRepository.Update(existingFeedback);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        //Delete
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
