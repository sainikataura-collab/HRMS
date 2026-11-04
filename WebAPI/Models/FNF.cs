using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class FNF
    {
    }

    [XmlRoot("NewDataSet")]
    public class fnfrequestmodel {

     
        public int PageIndex1 { get; set; }
        public int PageSize1 { get; set; }

        public int PageIndex2 { get; set; }
        public int PageSize2 { get; set; }
        public string EmpCode { get; set; } = "";
        public string EmpCodeManual { get; set; } = "";
        public string EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string SelectedNature { get; set; } = "";
        public string SelectedCity { get; set; } = "";
        public string SortBy { get; set; } = ""; // Default sorting column       
        public string EmpStatus { get; set; } = "";
       
        public string fk_classid { get; set; } = "";

        public string? searchTerm1 { get; set; } = null;

        public string? searchTerm2 { get; set; } = null;



    }

    public class FnfSettlementMst
    {
        public long pk_fnfsettlementId { get; set; }
        public string? fk_empid { get; set; }
        public long fk_seprequestId { get; set; }
        public long pk_seprequestId { get; set; }

        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? designation { get; set; }
        public string? department { get; set; }
        public string? classname { get; set; }
        public string? locname { get; set; }

        public string? dateofjoining { get; set; }
        public string? leftdate { get; set; }
        public string? reqdate { get; set; }

        public decimal totNoOfDaysWorked { get; set; }
        public decimal daysNoticeReq { get; set; }
        public decimal daysNoticeGiven { get; set; }
        public decimal daysShortfallNotice { get; set; }
        public decimal shortfallAdjusted { get; set; }
        public decimal noticerecoverydays { get; set; }
        public decimal noOfDaysWorkdInMonth { get; set; }
        public decimal noOfDaysConsidered { get; set; }
        public decimal balAnnualLeaveTot { get; set; }

        public decimal totEarnings { get; set; }
        public decimal totDeductions { get; set; }
        public decimal totOtherEarnings { get; set; }
        public decimal totOtherDeductions { get; set; }
        public decimal totGEarnings { get; set; }
        public decimal totGDeductions { get; set; }
        public decimal NetPay { get; set; }

        public long TenureYear { get; set; }
        public long TenureMonth { get; set; }
        public long TenureDay { get; set; }
        public string? pk_empid { get; set; }

        public decimal daysworkedwithus { get; set; }
        public decimal noticePeriod { get; set; }
        //public decimal Noofdaysnoticegiven { get; set; }
        public decimal daysshortfallinnoticeperiod { get; set; }
        //public decimal Noticerecoverydays { get; set; }
        public decimal paiddays { get; set; }
        //public decimal DaystobeConsidered { get; set; }
        public decimal EL { get; set; }
        public string? Zone { get; set; }
        public string? FunctionName { get; set; }

        public List<FnfSettlementHeadMst> heads { get; set; } = new();
    }

    public class FnfSettlementHeadMst
    {
        public long pk_fnfsettlementTrnId { get; set; }
        public long fk_fnfsettlementId { get; set; }

        public string? headName { get; set; }
        public int sno { get; set; }
        public string? headType { get; set; }

        public decimal amount { get; set; }
        public decimal Rate_amount { get; set; }
        public bool isActive { get; set; } = true;
    }

}
