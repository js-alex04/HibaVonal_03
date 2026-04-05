using System.ComponentModel.DataAnnotations;

namespace HibaVonal_03.DTOs.Auth
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Az email cím megadása kötelező!")]
        [EmailAddress(ErrorMessage = "Érvénytelen email formátum!")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "A jelszó megadása kötelező!")]
        public string Password { get; set; } = null!;
    }
}