using System.ComponentModel.DataAnnotations; 

namespace HibaVonal_03.Entities
{
    public class MaintainerSpecialisation
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public ICollection<Fault> AssignedFaults { get; set; } = new List<Fault>(); // a specialization can be associated with multiple faults, but a fault can only be associated with one specialization
        public ICollection<Maintainer> Maintainers { get; set; } = new List<Maintainer>(); // a specialization can be associated with multiple maintainers, but a maintainer can have multiple specializations
    }
}
