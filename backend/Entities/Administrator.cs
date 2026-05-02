namespace HibaVonal_03.Entities
{
    public class Administrator : User
    {
        protected Administrator() : base() { }
        public Administrator(int id, string name, string email, string password)
            : base(id, name, email, password, Role.Administrator) { }
    }
}