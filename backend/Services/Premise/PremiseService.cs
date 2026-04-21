using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using HibaVonal_03.Entities;
using HibaVonal_03.Interfaces.Premise;
using HibaVonal_03.Repositories;

namespace HibaVonal_03.Services.Premise
{
    internal class PremiseService : IPremiseService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PremiseService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PremiseResponseDto> CreatePremiseAsync(PremiseCreateDto premise)
        {
            // Note: keeping original logic, but awaiting repository call.
            var existing = await _unitOfWork.PremiseRepository.GetByIdAsync(premise.Floor);
            if (existing == null)
            {
                throw new Exception("A maintainer specialisation with the same name already exists.");
            }
            else
            {
                var newpremise = new Entities.Premise(premise.Floor, premise.Type, premise.NameOrNumber);

                await _unitOfWork.PremiseRepository.AddAsync(newpremise);
                await _unitOfWork.SaveChangesAsync();

                return new PremiseResponseDto
                {
                    Floor = newpremise.Floor,
                    Type = newpremise.Type,
                    NameOrNumber = newpremise.NameOrNumber
                };
            }
        }

        public async Task<bool> DeletePremiseAsync(int id)
        {
            var applianceToDelete = await _unitOfWork.PremiseRepository.GetByIdAsync(id);
            if (applianceToDelete == null)
            {
                return false;
            }
            else
            {
                _unitOfWork.PremiseRepository.Delete(applianceToDelete);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public async Task<List<PremiseResponseDto>> GetAllPremiseAsync()
        {
            var allpremise = await _unitOfWork.PremiseRepository.GetAllAsync();

            var premiseDtos = new List<PremiseResponseDto>();
            foreach (var premise in allpremise)
            {
                premiseDtos.Add(new PremiseResponseDto
                {
                    Id = premise.Id,
                    Floor = premise.Floor,
                    Type = premise.Type,
                    NameOrNumber = premise.NameOrNumber,
                });
            }
            return premiseDtos;
        }

        public async Task<PremiseResponseDto> GetPremiseByIdAsync(int id)
        {
            var premise = await _unitOfWork.PremiseRepository.GetByIdAsync(id);
            if (premise == null)
            {
                return null;
            }
            else
            {
                return new PremiseResponseDto
                {
                    Id = premise.Id,
                    Floor = premise.Floor,
                    Type = premise.Type,
                    NameOrNumber = premise.NameOrNumber,
                };
            }
        }

        public async Task<bool> UpdatePremiseAsync(int id, PremiseUpdateDto premise)
        {
            var premiseToUpdate = await _unitOfWork.PremiseRepository.GetByIdAsync(id);
            if (premiseToUpdate == null)
            {
                return false;
            }
            else
            {
                premiseToUpdate.Floor = premise.Floor;
                premiseToUpdate.Type = (PremiseType)premise.Type;
                premiseToUpdate.NameOrNumber = premise.NameOrNumber;
                _unitOfWork.PremiseRepository.Update(premiseToUpdate);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }
    }
}
