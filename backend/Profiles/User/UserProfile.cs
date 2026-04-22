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
            CreateMap<User, UserDto>();
            CreateMap<CollegiateCreateDto, Collegiate>();
            CreateMap<MaintainerCreateDto, Entities.Maintainer>();
            CreateMap<UserCreateDto, User>();
        }
    }
}
