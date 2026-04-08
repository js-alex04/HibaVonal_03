using HibaVonal_03.DTOs.Auth;
using HibaVonal_03.Interfaces.Auth;
using HibaVonal_03.Repositories;
using System.Linq;

namespace HibaVonal_03.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserDto?> LoginAsync(LoginRequestDto request)
        {
            // Most már használhatjuk az okos GetAsync metódust szűréssel!
            var users = await _unitOfWork.UserRepository.GetAsync(
                filter: u => u.Email == request.Email && u.Password == request.Password);

            var user = users.FirstOrDefault();

            if (user == null)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString()
            };
        }
    }
}