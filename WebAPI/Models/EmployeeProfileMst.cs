namespace HRMSWebAPI.Models
{
    public class EmployeeFullProfileResponse
    {
        public EmployeeProfileMst EmployeeProfileMst { get; set; }
        public List<EmployeeQualification> EmployeeQualification { get; set; }
        public List<EmployeePreviousJob> EmployeePreviousJob { get; set; }
        public List<EmployeeLetter> EmployeeLetter { get; set; }
        public List<ReportingInfo1> ReportingInfo1 { get; set; }
        public List<ReportingInfo2> ReportingInfo2 { get; set; }
    }
    public class EmployeeProfileMst
    {
        public string Pk_EmpId { get; set; }
        public string EmpCode { get; set; }
        public string EmpName { get; set; }
        public string Fathername { get; set; }
        public string Bankname { get; set; }
        public string Accountno { get; set; }
        public string IFSCCODE { get; set; }
        public string esino { get; set; }
        public string PANCard { get; set; }
        public string DOB { get; set; }
        public string DOJ { get; set; }
        public string DOC { get; set; }
        public string EmployeeLeftStatus { get; set; }
        public string OfficialEmailID { get; set; }
        public string OfficialMobileNo { get; set; }
        public string PersonalEmailID { get; set; }
        public string PersonalMobileNo { get; set; }
        public string Intime { get; set; }
        public string Outtime { get; set; }
        public string Gracetime { get; set; }
        public string UANCard { get; set; }
        public string AadharCard { get; set; }
        public string City { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string Nature { get; set; }
        public string Grade { get; set; }
        public string FunctionalDesignation { get; set; }
        public string Location { get; set; }
        public string Zone { get; set; }
        public string Operational { get; set; }
        public string AttendanceSource { get; set; }
        public string TransportType { get; set; }
        public string ResidentialAddress { get; set; }
        public string PermanentAddress { get; set; }
        public string Gender { get; set; }
        public string Experience { get; set; }

        //

        public bool? policy_app { get; set; }
        public string? policyNo { get; set; }
        public string? uanNo { get; set; }
        public decimal? policy_amount { get; set; }
        public DateTime? policyDate { get; set; }
        public DateTime? policyTillValid { get; set; }
        public string? policyImagePath { get; set; }
    }
    public class EmployeeQualification
    {
        public int Pk_EmpQualId { get; set; }
        public string Fk_EmpId { get; set; }
        public int Fk_QualId { get; set; }
        public int Fk_SubjectId { get; set; }
        public int Fk_InsId { get; set; }
        public string Qualification { get; set; }
        public string Subject { get; set; }
        public string Institute { get; set; }
        public string PassYear { get; set; }
        public string Marks { get; set; }
        public string Division { get; set; }
        public string DocumentUpload { get; set; }
        public byte[]? Timestamp { get; set; }
    }
    public class EmployeePreviousJob
    {
        public int Pk_PJobId { get; set; }
        public string Fk_EmpId { get; set; }
        public string compname { get; set; }
        public string Designation { get; set; }
        public string Department { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string CTC { get; set; }
        public string DocumentUpload { get; set; }
        public string Profile { get; set; }
        public string LeavingReason { get; set; }
        public byte[]? Timestamp { get; set; }
    }
    public class EmployeeLetter
    {
        public int Pk_LetterId { get; set; }
        public string LetterName { get; set; }
        public string IssueDate { get; set; }
    }
    public class ReportingInfo1
    {
        public string Pk_EmpId { get; set; }
        public string EmpCode { get; set; }
        public string EmpName { get; set; }
        public string Fathername { get; set; }
        public string DOJ { get; set; }
        public string DOC { get; set; }
        public string OfficialEmailID { get; set; }
        public string OfficialMobileNo { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string Nature { get; set; }
        public string Grade { get; set; }
        public string FunctionalDesignation { get; set; }
        public string Location { get; set; }
        public string Zone { get; set; }
        public string ReportingType { get; set; }
        public string Gender { get; set; }
    }
    public class ReportingInfo2
    {
        public string Pk_EmpId { get; set; }
        public string EmpCode { get; set; }
        public string EmpName { get; set; }
        public string Fathername { get; set; }
        public string DOJ { get; set; }
        public string DOC { get; set; }
        public string OfficialEmailID { get; set; }
        public string OfficialMobileNo { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public string Nature { get; set; }
        public string Grade { get; set; }
        public string FunctionalDesignation { get; set; }
        public string Location { get; set; }
        public string Zone { get; set; }
        public string ReportingType { get; set; }
        public string Gender { get; set; }
    }

}