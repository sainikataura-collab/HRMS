using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    [XmlRoot("NewDataSet")]

    public class ManpowerMstDataSet
    {
        [XmlElement("REC_JobRequisition_Mst")]
        public ManpowerMst ManpowerMst { get; set; }

        [XmlElement("REC_JobRequisition_Qualification")]
        public List<ManpowerQualification> ManpowerQualification { get; set; } = new();

        [XmlElement("REC_JobRequisition_Specialization")]
        public List<ManpowerSpecialization> ManpowerSpecialization { get; set; } = new();

    }

    public class ManpowerMst
    {
        public long? pk_reqid { get; set; }
        public string? jobtitle { get; set; }
        public string? empcode { get; set; }
        public string? empname  { get; set; }
        public string? location { get; set; }
        public string? department { get; set; }
        public string? designation { get; set; }
        public string? fk_locid { get; set; }
        public string? fk_deptid { get; set; }
        public string? fk_desgid { get; set; }
        public string? fk_classid { get; set; }
        public string? dated { get; set; }                  // format: "dd/MM/yyyy"
        public string? approvaldate { get; set; }           // format: "dd/MM/yyyy"
        public short? No_of_post { get; set; }
        public decimal? Experience_From { get; set; }
        public decimal? Experience_To { get; set; }
        public decimal? Age_From { get; set; } = 0;
        public decimal? Age_To { get; set; } = 0;
        public decimal? CTC_From { get; set; }
        public decimal? CTC_To { get; set; }
        public string? status { get; set; }
        public string? Statuss { get; set; }
        public int? final_approval { get; set; }
        public int? current_approval { get; set; }
        public string? Remarks { get; set; }
        public string? Remarks1 { get; set; }
        public string? Remarks2 { get; set; }
        public string? quali { get; set; }
        public string? spacli { get; set; }
        public string? fk_empid { get; set; }
        public string? CancelDate { get; set; }             // format: "dd/MM/yyyy"
        public string? Mrfcode { get; set; }
        public string? fk_costcentreid { get; set; }
        public string? Reason_of_Requirement { get; set; }
        public string? Reason_of_Replacement { get; set; }
        public string? Justification_of_Position { get; set; }
        public string? Position_Reports_To { get; set; }
        public string? Roles_Responsibilities { get; set; }
        public string? Technical_Skills { get; set; }
        public string? Behavioral_Skills { get; set; }
        public string? Additional_Qualities { get; set; }
        public byte[]? Timestamp { get; set; }              // auto-generated from DB
    }


    public class ManpowerQualification
    {
        public long? fk_reqid { get; set; }
        public string? fk_qualiId { get; set; }
    }
    public class ManpowerSpecialization
    {
        public long? fk_reqid { get; set; }
        public string? fk_specializationId { get; set; }
    }
    public class ManpowerRequisitionGridModel
    {
        public long? Pk_ReqId { get; set; }
        public string? JobTitle { get; set; }
        public string? Mrfcode { get; set; }
        public string? Location { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? EmpName { get; set; }
        public string? Dated { get; set; }            // Ideally DateTime, but stored procedure returns varchar(20)
        public short? No_Of_Post { get; set; }
        public short? Experience_From { get; set; }
        public short? Experience_To { get; set; }
        public string? Status { get; set; }           // 'Agree' / 'Disagree'
        public bool? EditStatus { get; set; }
        public bool? DeleteStatus { get; set; }
        public string? EditImageName { get; set; }
        public string? DeleteImageName { get; set; }
    }



}
