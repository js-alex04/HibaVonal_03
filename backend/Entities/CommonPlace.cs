namespace HibaVonal_03.Entities
{
    public class CommonPlace : Premises
    {
        public string Name { get; set; } = null!;
        public CommonPlace(int id, int floor, string name) : base(id, floor)
        {
            this.Name = name;
        }
    }
}
