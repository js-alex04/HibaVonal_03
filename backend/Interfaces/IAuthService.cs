using HibaVonal_03.DTOs.Auth;

namespace HibaVonal_03.Interfaces.Auth
{
    public interface IAuthService
    {
        Task<UserDto?> LoginAsync(LoginRequestDto request);
    }
}