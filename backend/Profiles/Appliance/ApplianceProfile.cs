using AutoMapper;
using HibaVonal_03.DTOs.Appliance;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class ApplianceProfile : Profile
    {
        public ApplianceProfile()
        {
            // Entitás -> Response DTO
            CreateMap<Appliance, ApplianceResponseDto>();

            // Create DTO -> Entitás
            CreateMap<ApplianceCreateDto, Appliance>();

            // Update DTO -> Entitás
            CreateMap<ApplianceUpdateDto, Appliance>();
        }
    }
}
