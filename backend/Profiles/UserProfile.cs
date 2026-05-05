using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // 1. szabály: a bázis osztályt (User) alakítjuk át bázis DTO-vá (UserResponseDto)
            CreateMap<User, UserResponseDto>()
                .Include<Collegiate, CollegiateResponseDto>()
                .Include<Maintainer, MaintainerResponseDto>();

            // 2. Szabály a Kollégistára (megkapja a saját DTO-ját, saját adataival)
            CreateMap<Collegiate, CollegiateResponseDto>()
                .ForMember(dest => dest.ReportedFaultIds, opt => opt.MapFrom(src => src.ReportedFaults.Select(f => f.Id)))
                .ForMember(dest => dest.FeedbackIds, opt => opt.MapFrom(src => src.ReportedFaults.SelectMany(f => f.Feedbacks).Select(fb => fb.Id)));

            // 3. Szabály a Karbantartóra (ő is a saját DTO-ját kapja)
            CreateMap<Entities.Maintainer, MaintainerResponseDto>()
                .ForMember(dest => dest.Specialisations, opt => opt.MapFrom(src => src.MaintenanceSpecialisation.Select(ms => ms.Name)));

            // 4. Admin és Manager: Nekik nincs extra adatuk, ők maradnak az alap DTO-nál
            CreateMap<Administrator, UserResponseDto>();
            CreateMap<MaintenanceManager, UserResponseDto>();

            CreateMap<CollegiateCreateDto, Collegiate>();
            CreateMap<MaintainerCreateDto, Maintainer>();
            CreateMap<UserCreateDto, User>();
        }
    }
}