using HibaVonal_03.Entities;
using System;

public class PremiseResponseDto
{
	public int Id { get; set; }
    public int Floor { get; set; }
    public PremiseType Type { get; set; }
    public string NameOrNumber { get; set; }
}
