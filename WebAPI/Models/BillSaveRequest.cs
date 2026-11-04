using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class BillSaveRequest
    {
        public string? EmpCode { get; set; } = "";
        public string? EmpCodeManual { get; set; } = "";
        public string? EmpName { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new List<string>();
        public string? SelectedDesignation { get; set; } = "";
        public List<string> SelectedLocations { get; set; } = new List<string>();
        public string? SelectedNature { get; set; } = "";
        public string? SelectedCity { get; set; } = "";
        public string? fk_monthId { get; set; } = "";
        public string? fk_yearId { get; set; } = "";
        public string? fk_stateId { get; set; } = "";
        public string? fk_costcentreid { get; set; } = "";
        public string? fk_companyid { get; set; } = "";
        public decimal? summaryCTC { get; set; }
        public decimal? summaryBonus { get; set; }
        public decimal? summaryTADA { get; set; }
        public decimal? summaryIncentive { get; set; }
        public decimal? summaryGratuity { get; set; }
        public decimal? summaryTotal { get; set; }
        public decimal? summaryAgencyCharges { get; set; }
        public decimal? summarySubTotal { get; set; }
        public decimal? summaryRecovery { get; set; }
        public decimal? summaryFinalTotal { get; set; }
        public decimal? summaryIGST { get; set; }
        public decimal? summaryCGST { get; set; }
        public decimal? summarySGST { get; set; }
        public decimal? summaryGrandTotal { get; set; }
        public List<BillEmployeeModel> EmployeeList { get; set; }
    }

    public class BillEmployeeModel
    {
        public string EmpCode { get; set; }
        public decimal? Insurance { get; set; }
        public decimal? Bonus { get; set; }
        public decimal? CTC_Including_Bonus { get; set; }
        public decimal? TADA { get; set; }
        public decimal? Incentive { get; set; }
        public decimal? Gratuity { get; set; }
        public string? Remarks { get; set; }
    }

    public class BillEmployeeDataSet
    {
        public List<BillEmployeeModel> BillEmployeeList { get; set; }
    }
}
