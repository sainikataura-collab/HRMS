namespace HRMSWebAPI.Models
{
    public class SalaryPayoutRequest
    {
        public string fk_monthId            { get; set; } = "";
        public string fk_yearId             { get; set; } = "";
        public string EmpCode               { get; set; } = "";
        public string EmpCodeManual         { get; set; } = "";
        public string EmpName               { get; set; } = "";
        public List<string> SelectedDepartments { get; set; } = new();
        public string SelectedDesignation   { get; set; } = "";
        public List<string> SelectedLocations   { get; set; } = new();
        public string SelectedNature        { get; set; } = "";
        public string SelectedCity          { get; set; } = "";
        public string SortBy                { get; set; } = "";
        public string fk_costcentreid       { get; set; } = "";
        public string ContractorName        { get; set; } = "";

        /// <summary>pk_empid values ticked in the Angular checkbox table</summary>
        public List<string> SelectedEmpIds  { get; set; } = new();

        /// <summary>
        /// Optional — filter paid-out table by a specific batch key.
        /// Null = show all paid-out employees for the month/year.
        /// </summary>
        public string? FilterBatchKey       { get; set; } = null;

        public int PendingPageIndex { get; set; } = 0;
        public int PendingPageSize { get; set; } = 10;
        public int PaidOutPageIndex { get; set; } = 0;
        public int PaidOutPageSize { get; set; } = 10;
        public string PendingSearchTerm { get; set; } = "";
        public string PaidOutSearchTerm { get; set; } = "";
        public bool IsSelectAll { get; set; } = false;

        public string? BankId { get; set; }
        public string? BankRefNo { get; set; }
        public string? PayoutRemark { get; set; }
    }
}
