using HibaVonal_03.DTOs.Auth;

namespace HibaVonal_03.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto?> LoginAsync(LoginRequestDto request);
    }
}