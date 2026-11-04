namespace HRBook_WebAPI.Models
{
    public class NoDueDeclarationMst
    {
        public int pk_noDueDeclarationId { get; set; }

        public long? fk_seprequestid { get; set; }
        public string? fk_empid { get; set; }

        public string? empcode { get; set; }
        public string? empname { get; set; }
        public string? department { get; set; }
        public string? hodName { get; set; }
        public bool noticePeriodServed { get; set; }
        public int noDueStatus { get; set; }

        public DateTime? resignationDate { get; set; }
        public DateTime? expectedLastWorkingDate { get; set; }
        public decimal? noticePeriod { get; set; }
        public string? status { get; set; }

        public long? pk_assetReturnId { get; set; }
        public decimal totalRecoveryAmount { get; set; }
        public string? recoveryStatus { get; set; }

        public bool noSalaryAdvance { get; set; }
        public bool noLoan { get; set; }
        public bool noReimbursement { get; set; }
        public bool noCompanyProperty { get; set; }

        public DateTime declarationDate { get; set; }
        public bool agreeDeclaration { get; set; }

        public bool active { get; set; }
        public DateTime insDate { get; set; }
    }
}