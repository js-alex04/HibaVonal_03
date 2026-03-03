namespace HibaVonal_03.Entities
{
    public class FaultStatus
    {
        enum Status
        { 
            InProgress, // The fault is currently being worked on.
            Repaired, // The fault has been repaired successfully.
            Unrepairable, // The fault cannot be repaired and may require replacement or further assessment.
            AwaitingParts // The repair is on hold until necessary parts are available.
        }
    }
}
