using DocumentFormat.OpenXml.Wordprocessing;
using System.Xml.Serialization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMSWebAPI.Models
{

    public class KRARequest
    {
        public string? RoleId { get; set; }
        public string? fk_empId { get; set; }
        public long SrNo { get; set; }
        public string? KPA { get; set; }
        public string? KRA { get; set; }
        public string? KPI { get; set; }
        public string? UserId { get; set; }
        public string? TargetValue { get; set; }
        public decimal? Weightage { get; set; }
        public IFormFile? FileBytes { get; set; }
        public string? AttachmentPath { get; set; }

        //public bool? Isuccessful { get; set; }
        //   public string? Message { get; set; }

        public bool IsActive { get; set; } = true;

    }
    public class KRAList
    {
        public string? RoleId { get; set; }
        public string? RoleName { get; set; }
        public string? empname { get; set; }
        public string? empcode { get; set; }
        public string? fk_empId { get; set; }
        public long? KRAID { get; set; }
        public long? SrNo { get; set; }
        public long? Total_Trn_Records { get; set; }
        public string? KPA { get; set; }
        public string? KRA { get; set; }
        public string? KPI { get; set; }
        public string? TargetValue { get; set; }
        public decimal? Weightage { get; set; }
        public string? AttachmentPath { get; set; }
    }





    [XmlRoot("NewDataSet")]

    public class RoleDataSet
    {

        [XmlElement("Role_Assessment")]

        public List<Self_Assesment_KRA> Role_Asse_KRA { get; set; } = new List<Self_Assesment_KRA>();


    }

    public class Self_Assesment_KRA
    {
        public long? fk_KRAId { get; set; }
        public int? ApprovalStatus { get; set; }
        public long? pk_KraAssessmentId { get; set; }


        public long? fk_kraperiodId { get; set; }
        public string? selfRemark { get; set; } = null;
        public decimal? selfAssessment { get; set; } = null;

        public decimal? RMAssessment { get; set; } = null;
        public string? RmRemark { get; set; } = null;
        public string? Rmfilename { get; set; } = null;

        public decimal? HODAssessment { get; set; } = null;
        public string? HODRemark { get; set; } = null;
        public string? HODfilename { get; set; } = null;

        public string? filename { get; set; }
        public int? fk_RoleId { get; set; }

        [XmlIgnore]
        public IFormFile? FileBytes { get; set; }

        public bool ShouldSerializeselfAssessment() => selfAssessment.HasValue;
        public bool ShouldSerializefk_RoleId() => fk_RoleId.HasValue;
        public bool ShouldSerializepk_KraAssessmentId() => pk_KraAssessmentId.HasValue;

        public bool ShouldSerializeRMAssessment() => RMAssessment.HasValue;
        public bool ShouldSerializefk_kraperiodId() => fk_kraperiodId.HasValue;

        public bool ShouldSerializeHODAssessment() => HODAssessment.HasValue;



    }





    [XmlRoot("NewDataSet")]

    public class RootDataSet
    {

        [XmlElement("Self_Assessment")]

        public List<kraSelfAss> Self_Asse_KRA { get; set; } = new List<kraSelfAss>();
        //public List<Self_Assesment_KRA> Self_Asse_KRA { get; set; } = new List<Self_Assesment_KRA>();


    }

    //self model 25june
    public class kraSelfAss
    {

        public string? fk_empid { get; set; }
        public string? kraPeriodId { get; set; }
        public long? pk_kraassTrnId { get; set; }
        public long? SrNo { get; set; }
        public long? KRAId { get; set; }

        public string? KPA { get; set; }
        public string? KRA { get; set; }
        public string? KPI { get; set; }


        public int? status { get; set; }


        public string? TargetValue { get; set; }
        public decimal? Weightage { get; set; }

        public string? AttachmentPath { get; set; } //filename  for kra

        [XmlIgnore]
        public IFormFile? FileBytes { get; set; }
        public decimal? SelfAssessment { get; set; }
        public string? AssessmentRemarks { get; set; }
        public string? AssessmentAttachmentPath { get; set; }
        public string? KRASource { get; set; }




    }


    //

    //for  rm upd





    [XmlRoot("NewDataSet")]

    public class updRootDataSet
    {

        [XmlElement("RM_Assessment")]

        public List<UpdModel> RM_Asse { get; set; } = new List<UpdModel>();


    }

    public class UpdModel
    {

        public long? pk_kraassId { get; set; }
        public long? KRAId { get; set; }
        public string? fk_empAppById { get; set; }
        public string? SrNo { get; set; }
        public decimal? rmAssessment { get; set; }
        public string? AssessmentAttachmentPath { get; set; }

        [XmlIgnore]
        public IFormFile? FileBytes { get; set; }
        public string? RmAssessmentRemarks { get; set; }
        public int? ApprovalStatus { get; set; }

    }



    [XmlRoot("NewDataSet")]

    public class HODRootDataSet
    {

        [XmlElement("HOD_Assessment")]

        public List<HODUpddel> HOD_Asse { get; set; } = new List<HODUpddel>();


    }

    public class HODUpddel
    {

        public long? pk_kraassId { get; set; }
        public long? HODTrnAppId { get; set; }
        public string? fk_empAppById { get; set; }
        public string? SrNo { get; set; }
        public decimal? HodAssessment { get; set; }
        public string? AssessmentAttachmentPath { get; set; }

        [XmlIgnore]
        public IFormFile? FileBytes { get; set; }
        public string? HODssessmentRemarks { get; set; }
        public int? ApprovalStatus { get; set; }

    }

    public class KRA_Get_Self_Assesment_data
    {
        public string? kpa { get; set; }
        public string? kra { get; set; }
        public string? kpi { get; set; }
        public string? targetvalue { get; set; }
        public decimal? weightage { get; set; }
        public string? fk_empid { get; set; }
        public string? KRAId { get; set; }

        //public long? pk_KraAssessmentId { get; set; }
        //public decimal? selfAssessment { get; set; }
        //public string? selfRemark { get; set; }
        //public decimal? HODAssessment { get; set; }
        //public string? HODRemark { get; set; }
        //public decimal? RMAssessment { get; set; }
        //public string? RmRemark { get; set; }

    }

    public class KRA_Get_Assesment_data
    {

        public string? kpa { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? kra { get; set; }
        public int? SrNo { get; set; }
        public long? pk_kraassTrnId { get; set; }
        public long? RmTrnAppId { get; set; }
        public long? HODTrnAppId { get; set; }
        public string? kpi { get; set; }
        public string? targetvalue { get; set; }
        public decimal? weightage { get; set; }

        public string? fk_empid { get; set; }
        public string? AttachmentPath { get; set; }
        public long? KRAId { get; set; }
        public long? pk_kraassId { get; set; }
        public long? kraPeriodId { get; set; }
        public long? selfAssessment { get; set; }
        public long? RmAssessment { get; set; }
        public string? AssessmentRemarks { get; set; }
        public string? RmAssessmentRemarks { get; set; }
        public string? AssessmentAttachmentPath { get; set; }
        public string? RmFilePath { get; set; }
        public string? HODFilePath { get; set; }
        public long? HODAssessment { get; set; }

        public string? HODAssessmentRemarks { get; set; }
        public string? status { get; set; }







        //public int? RoleId { get; set; }

        //public string? fk_kraperiodId { get; set; }
        //public long? pk_KraAssessmentId { get; set; }

        //public decimal? selfAssessment { get; set; }
        //public string? selfRemark { get; set; }
        //public string? filename { get; set; }

        //public decimal? RMAssessment { get; set; }
        //public string? RmRemark { get; set; }
        //public string? Rmfilename { get; set; }

        //public decimal? HODAssessment { get; set; }
        //public string? HODRemark { get; set; }
        //public string? HODfilename { get; set; }

    }



    public class getlistforRM
    {
        public long? KRAId { get; set; }
        public long? fk_kraperiodId { get; set; }

        public int status { get; set; }
        public long? pk_KraAssessmentId { get; set; }
        public string? description { get; set; }
        public string? fk_empid { get; set; }

        public decimal? RMAssessment { get; set; }
        public string? RmRemark { get; set; }
        public int? ApprovalStatus { get; set; }



        public string EmpCode { get; set; }

        public string pk_kraassId { get; set; }
        public string EmpName { get; set; }
        public string Location { get; set; }
        public string Period { get; set; }
        public string ApprovalStatusText { get; set; }
        public long krapPeriodId { get; set; }

    }
    public class getlistforSelf
    {
        public long? KRAId { get; set; }
        public long? pk_kraassTrnId { get; set; }
        //public long? fk_kraperiodId { get; set; }   
        //public long? pk_KraAssessmentId { get; set; } 
        //public string ? description { get; set; }
        //public string ? fk_empid { get; set; }

        //public decimal? SelfAssessment { get; set; }
        //public string? SelfRemark { get; set; }
        //public string? ApprovalStatus { get; set; }

        public string EmpCode { get; set; }

        public string pk_kraassId { get; set; }
        public string EmpName { get; set; }
        public string Location { get; set; }
        public string Period { get; set; }
        public string ApprovalStatusText { get; set; }
        public long krapPeriodId { get; set; }
        public string fk_empid { get; set; }
        public int status { get; set; }


    }
    public class getlistforHOD
    {
        public long? KRAId { get; set; }
        public long? pk_kraassTrnId { get; set; }
        public int status { get; set; }


        //public long? fk_kraperiodId { get; set; }   
        //public long? pk_KraAssessmentId { get; set; } 
        //public string ? description { get; set; }
        //public string ? fk_empid { get; set; }

        //public decimal? SelfAssessment { get; set; }
        //public string? SelfRemark { get; set; }
        //public string? ApprovalStatus { get; set; }

        public string EmpCode { get; set; }

        public string pk_kraassId { get; set; }
        public string EmpName { get; set; }
        public string Location { get; set; }
        public string Period { get; set; }
        public string ApprovalStatusText { get; set; }
        public long krapPeriodId { get; set; }
        public string fk_empid { get; set; }


    }

    public class RoleAssessmentList
    {
        public long? fk_KRAId { get; set; }
        public int? RoleId { get; set; }
        public long? pk_KraAssessmentId { get; set; }

        public decimal? Assessment { get; set; }
        public string? Remark { get; set; }

        public int? ApprovalStatus { get; set; }
    }


}




