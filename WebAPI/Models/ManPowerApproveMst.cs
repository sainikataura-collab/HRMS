using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]

    public class ManPowerApproveMstApprovalDataSet
    {
        [XmlElement("REC_JobRequisition_Mst_Approval")]
        public List<JobRequisitionApproval> JobRequisitionApproval { get; set; }
    }

    public class ManPowerApproveMstDataSet
    {
        public List<ManPowerApproveMstFrist> ManPowerApproveMstFrist { get; set; } = new();
        public List<ManPowerApproveMstFristSecond> ManPowerApproveMstFristSecond { get; set; } = new();

    }

    public class JobRequisitionApproval
    {

        public long? pk_reqtrnid { get; set; }
        public long? fk_reqid { get; set; }
        public string? fk_empId { get; set; }
        public string? dated { get; set; }
        public int? approvelOrder { get; set; }
        public string? remarks { get; set; }
        public bool? isActive { get; set; } = true;
    }


    public class ManPowerApproveMstFrist
    {
        public long? Pk_ReqId { get; set; }
        public string? Dated { get; set; }
        public string? jobtitle { get; set; }
        public string? Location { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public short? No_Of_Post { get; set; }
        public short? Experience_From { get; set; }
        public short? Experience_To { get; set; }
        public string? EmpCode { get; set; }
        public string? EmpName { get; set; }
        public string? Status { get; set; }
        public string? Mrfcode { get; set; }

        // ✅ New fields from updated SP
        public string? Fk_LocId { get; set; }
        public string? Fk_DeptId { get; set; }
        public string? Fk_DesgId { get; set; }
        public string? Fk_ClassId { get; set; }
        public decimal? CTC_From { get; set; }
        public decimal? CTC_To { get; set; }
        public string? Remarks { get; set; }
        public string? ReasonOfRequirement { get; set; }
        public string? ReasonOfReplacement { get; set; }
        public string? JustificationOfPosition { get; set; }
        public string? PositionReportsTo { get; set; }
        public string? RolesResponsibilities { get; set; }
        public string? TechnicalSkills { get; set; }
        public string? BehavioralSkills { get; set; }
        public string? AdditionalQualities { get; set; }
        public string? Quali { get; set; }
        public string? Spacli { get; set; }


    }
    public class ManPowerApproveMstFristSecond
    {
        public long? Pk_ReqId { get; set; }
        public string? Dated { get; set; }
        public string? jobtitle { get; set; }
        public string? Location { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public short? No_Of_Post { get; set; }
        public short? Experience_From { get; set; }
        public short? Experience_To { get; set; }
        public string? EmpCode { get; set; }
        public string? EmpName { get; set; }
        public string? Status { get; set; }
        public string? Mrfcode { get; set; }

        // ✅ New fields from updated SP
        public string? Fk_LocId { get; set; }
        public string? Fk_DeptId { get; set; }
        public string? Fk_DesgId { get; set; }
        public string? Fk_ClassId { get; set; }
        public decimal? CTC_From { get; set; }
        public decimal? CTC_To { get; set; }
        public string? Remarks { get; set; }
        public string? ReasonOfRequirement { get; set; }
        public string? ReasonOfReplacement { get; set; }
        public string? JustificationOfPosition { get; set; }
        public string? PositionReportsTo { get; set; }
        public string? RolesResponsibilities { get; set; }
        public string? TechnicalSkills { get; set; }
        public string? BehavioralSkills { get; set; }
        public string? AdditionalQualities { get; set; }
        public string? Quali { get; set; }
        public string? Spacli { get; set; }


    }
}
