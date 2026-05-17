using AutoMapper;
using HibaVonal_03.DTOs;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            CreateMap<Feedback, FeedbackResponseDto>()
                .ForMember(dest => dest.CollegiateId, opt => opt.MapFrom(src => src.Fault.CollegiateId))
                .ForMember(dest => dest.CollegiateEmail, opt => opt.MapFrom(src => src.Fault.Collegiate.Email));

            CreateMap<FeedbackCreateDto, Feedback>();
        }
    }
}