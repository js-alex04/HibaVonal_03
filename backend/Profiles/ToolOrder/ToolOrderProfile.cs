using AutoMapper;
using HibaVonal_03.DTOs.ToolOrder;
using HibaVonal_03.Entities;

namespace HibaVonal_03.Profiles
{
    public class ToolOrderProfile : Profile
    {
        public ToolOrderProfile()
        {
            CreateMap<ToolOrder, ToolOrderResponseDto>();

            CreateMap<ToolOrderCreateDto, ToolOrder>();
        }
    }
}