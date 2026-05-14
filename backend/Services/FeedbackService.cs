using AutoMapper;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
using HibaVonal_03.DTOs;
using HibaVonal_03.Interfaces;
using HibaVonal_03.Repositories;
using HibaVonal_03.Entities;

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
            return await _unitOfWork.FeedbackRepository.GetQueryable()
                .ProjectTo<FeedbackResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        // Read by ID
        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(int feedbackId)
        {
            var feedbackDto = await _unitOfWork.FeedbackRepository.GetQueryable()
                .Where(f => f.Id == feedbackId)
                .ProjectTo<FeedbackResponseDto>(_mapper.ConfigurationProvider)
                .SingleOrDefaultAsync() ?? throw new KeyNotFoundException($"A visszajelzés a megadott azonosítóval ({feedbackId}) nem található.");

            return feedbackDto;
        }

        // Update
        public async Task<FeedbackResponseDto> UpdateFeedbackAsync(int feedbackId, FeedbackUpdateDto feedback)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetByIdAsync(feedbackId)
                ?? throw new KeyNotFoundException($"A visszajelzés a megadott azonosítóval ({feedbackId}) nem található.");

            _mapper.Map(feedback, existingFeedback);

            _unitOfWork.FeedbackRepository.Update(existingFeedback);

            // A visszajelzés szövegének frissítése után a hiba állapotát újra "Folyamatban" állapotra állítjuk, hogy jelezzük, hogy a visszajelzés újra feldolgozásra vár.
            existingFeedback.Fault.Status = FaultStatus.InProgress;

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