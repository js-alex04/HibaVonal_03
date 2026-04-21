using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.MaintainerSpecialisation;
using HibaVonal_03.Repositories;
using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Text;

namespace HibaVonal_03.Services.MaintainerSpecialisation
{
    internal class MaintainerSpecialisationService : IMaintainerSpecialisationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MaintainerSpecialisationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MaintainerSpecialisationResponseDto> CreateMaintainerSpecialisationAsync(MaintainerSpecialisationCreateDto maintainerSpecialisation)
        {
            if (await _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(maintainerSpecialisation.Id) == null)
            {
                
              throw new Exception("A maintainer specialisation with the same name already exists.");
                
            }
            else
            {
                var newMaintainerSpecialisation = new Entities.MaintainerSpecialisation
                {
                    Id = maintainerSpecialisation.Id,
                    Name = maintainerSpecialisation.Name
                };

                await _unitOfWork.MaintainerSpecialisationRepository.AddAsync(newMaintainerSpecialisation);
                await _unitOfWork.SaveChangesAsync();

                return new MaintainerSpecialisationResponseDto
                {
                    Id = newMaintainerSpecialisation.Id,
                    Name = newMaintainerSpecialisation.Name
                };
            }
                
            

        }

        public Task<bool> DeleteMaintainerSpecialisationAsync(int id)
        {
            var maintainerSpecialisationToDelete = _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id).Result;
            if (maintainerSpecialisationToDelete == null)
            {
                throw new Exception("Maintainer specialisation not found.");

            }
            else
            {
                _unitOfWork.MaintainerSpecialisationRepository.Delete(maintainerSpecialisationToDelete);
                return _unitOfWork.SaveChangesAsync().ContinueWith(task => task.Result > 0);
            }
        }

        public Task<List<MaintainerSpecialisationResponseDto>> GetAllMaintainerSpecialisationAsync()
        {
            var maintainerSpecialisations = _unitOfWork.MaintainerSpecialisationRepository.GetAllAsync().Result;
            var maintainerSpecialisationDtos = new List<MaintainerSpecialisationResponseDto>();

            foreach (var maintainerSpecialisation in maintainerSpecialisations)
            {
                maintainerSpecialisationDtos.Add(new MaintainerSpecialisationResponseDto
                {
                    Id = maintainerSpecialisation.Id,
                    Name = maintainerSpecialisation.Name
                });
            }

            return Task.FromResult(maintainerSpecialisationDtos);
        }

        public Task<MaintainerSpecialisationResponseDto> GetMaintainerSpecialisationByIdAsync(int id)
        {
            var maintainerSpecialisation = _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id).Result;
            if (maintainerSpecialisation == null)
            {
                throw new Exception("Maintainer specialisation not found.");
            }
            else
            {
                return Task.FromResult(new MaintainerSpecialisationResponseDto
                {
                    Id = maintainerSpecialisation.Id,
                    Name = maintainerSpecialisation.Name
                });
            }
        }

        public Task<bool> UpdateMaintainerSpecialisationAsync(int id, MaintainerSpecialisationUpdateDto maintainerSpecialisation)
        {
            var maintainerSpecialisationToUpdate = _unitOfWork.MaintainerSpecialisationRepository.GetByIdAsync(id).Result;

            if (maintainerSpecialisationToUpdate == null)
            {
                throw new Exception("Maintainer specialisation not found.");
            }
            else
            {
                maintainerSpecialisationToUpdate.Name = maintainerSpecialisation.Name;
                _unitOfWork.MaintainerSpecialisationRepository.Update(maintainerSpecialisationToUpdate);
                return _unitOfWork.SaveChangesAsync().ContinueWith(task => task.Result > 0);
            }
        }                
    }
}
