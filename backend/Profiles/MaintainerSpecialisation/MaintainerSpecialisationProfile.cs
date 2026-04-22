using AutoMapper;
using HibaVonal_03.DTOs.MaintainerSpecialisation;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class MaintainerSpecialisationProfile : Profile
    {
        public MaintainerSpecialisationProfile()
        {
            // Entitás -> Response DTO
            CreateMap<MaintainerSpecialisation, MaintainerSpecialisationResponseDto>();

            // Request DTO -> Entitás
            CreateMap<MaintainerSpecialisationCreateDto, MaintainerSpecialisation>();

            // Update DTO -> Entitás
            CreateMap<MaintainerSpecialisationUpdateDto, MaintainerSpecialisation>();
        }
    }
}
