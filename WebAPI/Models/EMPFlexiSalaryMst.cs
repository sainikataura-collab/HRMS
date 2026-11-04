using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    //public class EMPFlexiSalaryMstDataSet
    //{

    //    public EMPFlexiSalaryMst SAL_EmployeeFlexiHeadBills_Mst { get; set; }

    //}
    public class SAL_EmployeeFlexiHeadBills_Mst
    {
        public long? pk_flexibillId { get; set; }
        public string? fk_empid { get; set; }
        public long? fk_headid { get; set; }
        public string? billDate { get; set; }
        public string? dated { get; set; }
        public decimal? amount { get; set; }
        public string? remarks { get; set; }
        public string? inctiveRemarks { get; set; }
        public string? filename { get; set; }
        [XmlIgnore]
        public IFormFile? FilePath { get; set; }
        public int? fileIndex { get; set; }
        public int? status { get; set; }
        public bool? isApproved { get; set; }
        public bool? isDisapproved { get; set; }
        public bool? isActive { get; set; }
    }
    public class SAL_EmployeeFlexiHeadBills_MstGetall
    {
        public long? pk_flexibillId { get; set; }
        public string? fk_empid { get; set; }
        public long? fk_headid { get; set; }
        public string? billDate { get; set; }
        public string? dated { get; set; }
        public decimal? amount { get; set; }
        public string? description { get; set; }
        public string? remarks { get; set; }
        public string? inctiveRemarks { get; set; }
        public string? filename { get; set; }
        public string? FilePath { get; set; }
        public string? isEnabled { get; set; }
        public int? fileIndex { get; set; }
        public string? status { get; set; }
        public bool? isApproved { get; set; }
        public bool? isDisapproved { get; set; }
        public bool? isActive { get; set; }
    }

    public class FlexiBillValidationResult
    {
        //public string? fk_empid { get; set; }
        //public string? fk_headid { get; set; }
        //public string? billDate { get; set; }
        //public decimal? billAmt { get; set; }
        public string? Flag { get; set; }              // 'Y' or 'N'
        public string? DateFlag { get; set; }          // Always 'Y' in this logic
        public decimal? BalBillAmt { get; set; }       // Remaining balance limit
        public int? FileIndex { get; set; }            // Auto-incremented file index
    }


    public class NameValueFlexi
    {
        public string? shortdesc { get; set; }
        public string? pk_headid { get; set; }

    }

    public class ApiResponse
    {
        public long DocumentId { get; set; }
        public string DocumentNo { get; set; }
        public bool IsSuccessfull { get; set; }
        public string Message { get; set; } = "";
    }

}
