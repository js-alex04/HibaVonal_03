using AutoMapper;
using HibaVonal_03.DTOs.Feedback;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            CreateMap<Entities.Feedback, FeedbackResponseDto>()
                .ForMember(dest => dest.CollegiateEmail, opt => opt.MapFrom(src => src.Collegiate.Email));

            CreateMap<FeedbackCreateDto, Feedback>();
        }
    }
}