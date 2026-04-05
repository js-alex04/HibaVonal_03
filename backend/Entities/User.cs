namespace HibaVonal_03.Entities
{
    public enum Role
    {
        Collegiate,
        Maintainer,
        Administrator,
        MaintenanceManager
    }
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public Role Role { get; set; }

        protected User() { } // Parameterless constructor for EF Core
        public User(int id, string name, string email, string password, Role role)
        {
            Id = id;
            Name = name;
            Email = email;
            Password = password;
            Role = role;
        }
    }
}
