using HibaVonal_03.Interfaces.Appliance;
using HibaVonal_03.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace HibaVonal_03.Services.Appliance
{
    internal class ApplianceService : IApplianceService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ApplianceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApplianceResponseDto> CreateAppilanceAsync(ApplianceCreateDto appliance)
        {
            if (await _unitOfWork.ApplianceRepository.GetByIdAsync(appliance.PremiseId) == null)
            {
                throw new ArgumentException("The specified premise does not exist.");
            }
            else {
                var newAppliance = new Entities.Appliance
                {
                    Name = appliance.Name,
                    PremiseId = appliance.PremiseId
                };

                await _unitOfWork.ApplianceRepository.AddAsync(newAppliance);
                await _unitOfWork.SaveChangesAsync();

                return new ApplianceResponseDto
                {
                    Id = newAppliance.Id,
                    Name = newAppliance.Name,
                    PremiseId = newAppliance.PremiseId
                };
            }        
        }

        public async Task<bool> DeleteApplianceAsync(int id)
        {
            
            var applianceToDelete = await _unitOfWork.ApplianceRepository.GetByIdAsync(id);
            if (applianceToDelete == null)
            {
                return false;
            }
            else
            {
                _unitOfWork.ApplianceRepository.Delete(applianceToDelete);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public Task<List<ApplianceResponseDto>> GetAllApplianceAsync()
        {

            var allappliances = _unitOfWork.ApplianceRepository.GetAllAsync();

            return allappliances.ContinueWith(task =>
            {
                var appliances = task.Result;
                var applianceDtos = new List<ApplianceResponseDto>();
                foreach (var appliance in appliances)
                {
                    applianceDtos.Add(new ApplianceResponseDto
                    {
                        Id = appliance.Id,
                        Name = appliance.Name,
                        PremiseId = appliance.PremiseId
                    });
                }
                return applianceDtos;
            });
        }

        public Task<ApplianceResponseDto> GetApplianceByIdAsync(int id)
        {
            var appliance = _unitOfWork.ApplianceRepository.GetByIdAsync(id);
            return appliance.ContinueWith(task =>
            {
                var result = task.Result;
                if (result == null)
                {
                    return null;
                }
                else
                {
                    return new ApplianceResponseDto
                    {
                        Id = result.Id,
                        Name = result.Name,
                        PremiseId = result.PremiseId
                    };
                }
            });
        }

        public Task<bool> UpdateApplianceAsync(int id, ApplianceUpdateDto appliance)
        {
            var applianceToUpdate = _unitOfWork.ApplianceRepository.GetByIdAsync(id);
            return applianceToUpdate.ContinueWith(task =>
            {
                var result = task.Result;
                if (result == null)
                {
                    return false;
                }
                else
                {
                    result.Name = appliance.Name;
                    result.PremiseId = appliance.PremiseId;
                    _unitOfWork.ApplianceRepository.Update(result);
                    _unitOfWork.SaveChangesAsync();
                    return true;
                }
            });
        }
    }
}
