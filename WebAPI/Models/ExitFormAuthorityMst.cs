using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class ExitFormAuthorityMst
    {
        // Wrapper to create XML

        [XmlRoot("NewDataSet")]
        public class ExitInterviewApprovalDetailWrapper
        {
            [XmlElement("FFS_ExitInterview_Approvedby_Detail")]
            public List<ExitInterviewApprovalDetail> Details { get; set; }
        }
        // Single record inside XML
        public class ExitInterviewApprovalDetail
        {
          // public string pk_Empid { get; set; }
            public string fk_empid { get; set; }
            public string fk_approvedbyid { get; set; }
            public int orderno { get; set; }
        }

        public class EmployeeApprovalDetail
        {
            public string Fk_EmpId { get; set; }
            public string Fk_ApprovedById { get; set; }
            public int OrderNo { get; set; }
            public string OrderNoDisplay { get; set; }
            public string EmpCode { get; set; }
            public string EmpName { get; set; }
            public string Designation { get; set; }
        }



    }
}
