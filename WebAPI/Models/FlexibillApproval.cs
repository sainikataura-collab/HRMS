using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class FlexibillApproval
    {



        public class FlexiBillRequestModel
        {
            public string? EmpCode { get; set; }

            public string? EmpName { get; set; }
            public string? LeftStatus { get; set; }
            public string? FkCompanyId { get; set; }
            public string? FkEmpId { get; set; }
            public string? FkFinId { get; set; }
            public List<string>? SelectedDepartments { get; set; } = new List<string>();
            public List<string>? SelectedLocations { get; set; } = new List<string>();
        }



        public class FlexiBillModel
        {
            public string? pk_flexibillId { get; set; }
            public string? pk_empid { get; set; }
            public string? empcode { get; set; }
            public string? empname { get; set; }
            public string? locname { get; set; }
            public string designation { get; set; }
            public string financialYear { get; set; }
            public string billDate { get; set; }
            public decimal amount { get; set; }
            public string filename { get; set; }
            public string description { get; set; }
            public string statusDes { get; set; }
            public string status { get; set; }
        }

        public class FlexiBillProcessModel
        {
            public List<FlexiBillModel> PendingBills { get; set; }
            public List<FlexiBillModel> ApprovedBills { get; set; }
        }


        [XmlRoot("NewDataSet")]
        public class ApprovalRootDataSet
        {

            [XmlElement("SAL_EmployeeFlexiHeadBills_Mst_Approval")]
            public FlexiBillApprovalIns flexiBillApprovalIns { get; set; }

        }


        public class FlexiBillApprovalIns
        {
            public long? fk_flexibillId { get; set; }
            public long? approvalStatus { get; set; }
            public string? remarks { get; set; }
            //public string? dated { get; set; }
            public string? fk_insUserId { get; set; }
        }


        public class GetByIdModel
        {
            public long? pk_flexibillId { get; set; }
            public string? billDate { get; set; }
            public string? dated { get; set; }
            public decimal? amount { get; set; }
            public decimal? Balanceamount { get; set; }
            public string? remarks { get; set; }
            public string? inctiveRemarks { get; set; }
            public long? fk_headid { get; set; }
            public string? description { get; set; }
         

        }


    }
}
