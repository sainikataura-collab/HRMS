
using System.Xml.Serialization;

[XmlRoot("NewDataSet")]
public class AttendanceConfigMst
{
    [XmlElement("SAL_LeaveConfig")]
    public SAL_LeaveConfig LeaveConfig { get; set; }
}

public class SAL_LeaveConfig
{
    public short fk_monthId { get; set; }
    public short fk_yearId { get; set; }
    public bool? IsLockedForApply { get; set; }
    public bool? IsLockedForApproval { get; set; }
    public short AttendanceProcessType { get; set; }

    // Monthly Setup
    public short? LateAllow { get; set; }
    public string? LateTime { get; set; }

    // Late Penalty
    public bool? IsLatePenalty { get; set; }
    public short? PenaltyOn { get; set; }
    public short? PenaltyLeaveType { get; set; }
    public short? LateCount { get; set; }
    public decimal? Deduction { get; set; }

    // Sandwich
    public bool? IsSandwichApplicable { get; set; }
    public string? SandwichOn { get; set; }





}
