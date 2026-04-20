using HibaVonal_03.DTOs.Fault;
using HibaVonal_03.Entities;
using AutoMapper;

namespace HibaVonal_03.Profiles
{
    public class FaultProfile : Profile
    {
        public FaultProfile()
        {
            CreateMap<Fault, FaultResponseDto>()
                .ForMember(dest => dest.CollegiateEmail,
                    opt => opt.MapFrom(src => src.Collegiate.Email))

                .ForMember(dest => dest.PremiseName,
                    opt => opt.MapFrom(src => src.Premise.NameOrNumber))

                .ForMember(dest => dest.ApplianceName,
                    opt => opt.MapFrom(src => src.Appliance != null ? src.Appliance.Name : null))

                .ForMember(dest => dest.SpecializationName,
                    opt => opt.MapFrom(src => src.Specialization != null ? src.Specialization.Name : null))

                .ForMember(dest => dest.AssignedMaintenanceEmail,
                    opt => opt.MapFrom(src => src.AssignedMaintenance != null ? src.AssignedMaintenance.Email : null));

            CreateMap<FaultCreateDto, Fault>();
        }
    }
}