using AutoMapper;
using HibaVonal_03.DTOs.Premise;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class PremiseProfile : Profile
    {
        public PremiseProfile()
        {
            // Entitás -> Response DTO
            CreateMap<Premise, PremiseResponseDto>();

            // Request DTO -> Entitás
            CreateMap<PremiseCreateDto, Premise>();

            // Update DTO -> Entitás
            CreateMap<PremiseUpdateDto, Premise>();
        }
    }
}