namespace HibaVonal_03.Entities
{
    public class Administrator : User
    {
        protected Administrator() : base() { } // Parameterless constructor for EF Core
        public Administrator(int id, string name, string email, string password) : base(id, name, email, password, Role.Administrator)
        {
        }

        public void AddFaultType(string typeName)
        {

        }
        public void RemoveFaultType(int typeId)
        {

        }
        public void AddEquipment(string equipName)
        {

        }
        public void RemoveEquipment(int equipId)
        {

        }
    }
}
