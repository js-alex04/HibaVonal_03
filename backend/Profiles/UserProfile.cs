using AutoMapper;
using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.DTOs.Collegiate;
using HibaVonal_03.DTOs.Maintainer;
using HibaVonal_03.DTOs.User;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // 1. Alap User mappolás, ami "továbbítja" a feladatot a megfelelő alosztálynak
            CreateMap<User, UserDto>()
                .Include<Entities.Maintainer, UserDto>() // Ha Maintainer jön, használd az alsó szabályt!
                .Include<Collegiate, UserDto>();         // Ha Collegiate jön, használd a másik szabályt!

            // 2. Kifejezetten a Maintainer mappolása (itt már ismeri a MaintenanceSpecialisation-t!)
            CreateMap<Entities.Maintainer, UserDto>()
                .ForMember(dest => dest.Specialisations, opt => opt.MapFrom(src =>
                    src.MaintenanceSpecialisation.Select(ms => ms.Name).ToList()));

            // 3. Kifejezetten a Collegiate mappolása (neki nincs szakterülete)
            CreateMap<Collegiate, UserDto>()
                .ForMember(dest => dest.Specialisations, opt => opt.Ignore());

            // A létrehozáshoz tartozó meglévő mappolásaid maradhatnak:
            CreateMap<CollegiateCreateDto, Collegiate>();
            CreateMap<MaintainerCreateDto, Entities.Maintainer>();
            CreateMap<UserCreateDto, User>();
        }
    }
}