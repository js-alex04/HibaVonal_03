namespace HibaVonal_03.Entities
{
    public class CommonPlace : Premise
    {
        public string Name { get; set; } = null!;

        protected CommonPlace() : base() { } // Parameterless constructor for EF Core
        public CommonPlace(int id, int floor, string name) : base(id, floor, PremiseType.CommonPlace)
        {
            this.Name = name;
        }
    }
}
