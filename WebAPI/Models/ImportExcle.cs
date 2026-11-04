using Org.BouncyCastle.Asn1.Ocsp;
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class Excel_leavetakenUploadRequest
    {
        [XmlElement("Excel")]
        public List<Excel_leavetakenUploadModelResponse> Excel_leavetakenUploadModelResponse { get; set; } = new List<Excel_leavetakenUploadModelResponse>();
    }

    public class Excel_leavetakenUploadModelResponse
    {

        public string Empcode { get; set; }

        public string EmpName { get; set; }


        public string LeaveType { get; set; }


        public string FromDate { get; set; }  // keep as string (dd/MM/yyyy) to match SQL


        public string ToDate { get; set; }


        public decimal Totaldays { get; set; }


        public string Remarks { get; set; }


        public string ContractorName { get; set; }
    }

    public class ImportExcle
    {

        [XmlRoot("NewDataSet")]
        public class ImportAttendanceRequestModel
        {
            public string? fk_costcentreid { get; set; } = "";
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
            public string FkMonthId { get; set; }
            public string FkYearId { get; set; }
            public string fk_classid { get; set; } = "";
            public int TemplateType { get; set; } = 1;




        }

        public class exportAttendanceModel
        {

            public List<exportAttendance> AttendanceNotmarked { get; set; }
            public List<exportAttendance> Attendancemarked { get; set; }
            public int NotMarkedCount { get; set; }
            public int MarkedCount { get; set; }
        }

        public class exportAttendance

        {
            public long CID { get; set; }
            public string PkEmpId { get; set; }
            public string EmpCode { get; set; }
            public string ManualEmpCode { get; set; }
            public string EmpName { get; set; }
            public string Location { get; set; }
            public string Department { get; set; }
            public string Designation { get; set; }

            public decimal totdays { get; set; }
            public decimal sl { get; set; }

            public decimal CL { get; set; }

            public decimal EL { get; set; }
            public decimal CompOff { get; set; }


            public decimal lwp { get; set; }
            public decimal nh { get; set; }
            public decimal DoubleNH { get; set; }
            public decimal woff { get; set; }
            public decimal OTHrs { get; set; }
            public decimal IT { get; set; }
            public decimal CsurCharge { get; set; }
            public decimal ECessCharge { get; set; }
            public decimal paiddays { get; set; }



        }



        public class ExcelUploadModelResponse
        {

            public string? OutletCode { get; set; } = "";
            public string Empcode { get; set; } = "";

            public string EmpName { get; set; } = "";
            public string FatherName { get; set; } = "";
            public string City { get; set; } = "";
            public string LocationCode { get; set; } = "";
            public string Location { get; set; } = "";
            public string Department { get; set; } = "";
            public string Designation { get; set; } = "";
            public string Nature { get; set; } = "";
            public string Grade { get; set; } = "";
            public string ReportingManager { get; set; } = "";
            public string HOD { get; set; } = "";
            public string Bank { get; set; } = "";
            public string AccountNo { get; set; } = "";
            public string Ifsccode { get; set; } = "";
            public string Status { get; set; } = "";


            [XmlIgnore]
            public DateTime? DOB { get; set; }

            [XmlElement("DOB")]
            public string DOBString
            {
                get => DOB.HasValue ? DOB.Value.ToString("dd-MM-yyyy HH:mm:ss") : "";
                set => DOB = DateTime.TryParse(value, out var date) ? date : (DateTime?)null;
            }

            [XmlIgnore]
            public DateTime? DOJ { get; set; }

            [XmlElement("DOJ")]
            public string DOJString
            {
                get => DOJ.HasValue ? DOJ.Value.ToString("dd-MM-yyyy HH:mm:ss") : "";
                set => DOJ = DateTime.TryParse(value, out var date) ? date : (DateTime?)null;
            }

            public string PFApp { get; set; } = "";
            public string ESIApp { get; set; } = "";
            public string PensionApp { get; set; } = "";
            public string VOLPFApp { get; set; } = "";
            public string ProfTaxApp { get; set; } = "";
            public string PANNo { get; set; } = "";
            public string Email { get; set; } = "";
            public string Gender { get; set; } = "";
            public string Religion { get; set; } = "";
            public string Category { get; set; } = "";
            public string Paymode { get; set; } = "";
            public string AdharcardNo { get; set; } = "";
            public string? ContractorName { get; set; } = "";
            public string? VendorName { get; set; } = "";
            public string? ServiceType { get; set; } = "";
            public string? BusinessVertical { get; set; } = "";
            public string? MobileNo { get; set; } = "";
            public string? ClientName { get; set; } = "";
        }

        [XmlRoot("NewDataSet")]
        public class ExcelUploadRequest
        {
            [XmlElement("Excel")]
            public List<ExcelUploadModelResponse> Employees { get; set; } = new();
        }


        //Import Attendance

        [XmlRoot("NewDataSet")]
        public class AttendanceImportRequest
        {
            [XmlElement("SAL_Attendance_Details")]
            public List<AttendanceDetail> AttendanceDetails { get; set; }

            [XmlElement("EmpLeft")]
            public List<EmpLeft> EmpLeftList { get; set; }
        }

        public class AttendanceDetail
        {
            // public string pk_attenid { get; set; }
            public string Empcode { get; set; }
            public decimal totdays { get; set; }
            public decimal sl { get; set; }
            public decimal CL { get; set; }

            public decimal EL { get; set; }
            public decimal CompOff { get; set; }
            public decimal lwp { get; set; }
            public decimal nh { get; set; }
            public decimal DoubleNH { get; set; }
            public decimal woff { get; set; }
            public decimal OTHrs { get; set; }
            public decimal IT { get; set; }
            public decimal CsurCharge { get; set; }
            public decimal ECessCharge { get; set; }
            public decimal paiddays { get; set; }
        }

        public class EmpLeft
        {
            public string fk_empid { get; set; }
        }

        public class ExportImportSalaryHeadRequest
        {
            public int? PageIndex { get; set; }
            public int? PageSize { get; set; }
            public string? EmpCode { get; set; } = "";
            public string? EmpCodeManual { get; set; } = "";
            public string? EmpName { get; set; } = "";
            public List<string> SelectedDepartments { get; set; } = new List<string>();
            public string? SelectedDesignation { get; set; } = "";
            public List<string>? SelectedLocations { get; set; } = new List<string>();
            public string? SelectedNature { get; set; } = "";
            public string? SelectedCity { get; set; } = "";
            public string? SortBy { get; set; } = ""; // Default sorting column       
            public string? fk_classid { get; set; } = "";
            public string? headtype { get; set; } = "";

            public string? fk_costcentreid { get; set; } = "";
            public string? empStatus { get; set; } = "";

        }

        public class emportSalaryHead
        {
            public string pk_empid { get; set; }

            public string EmpCode { get; set; }
            public string EmpName { get; set; }
            public string Location { get; set; }
            public string Department { get; set; }
            public string Designation { get; set; }
            public string Grade { get; set; }
            public decimal HRA { get; set; }
            public decimal Conveyance { get; set; }
            public decimal SplAllow { get; set; }
            public decimal PI { get; set; }
            public decimal VariablePay { get; set; }
        }




        [XmlRoot("NewDataSet")]
        public class emportsalayrHeadModel
        {
            [XmlElement("SAL_EmployeeHead_Details")]
            public List<emportSalaryHead> emportSalaryHeads { get; set; } = new();
        }







        [XmlRoot("NewDataSet")]
        public class EmployeeImportRequest
        {
            [XmlElement("SAL_Employee_FullDetails")]
            public List<EmployeeFullDetails> Employees { get; set; }
        }

        public class EmployeeFullDetails
        {
            public string empcode { get; set; }
            public string empName { get; set; }
            public string fatherName { get; set; }
            public string motherName { get; set; }
            public string panno { get; set; }
            public string adhaarNo { get; set; }
            public string uanNo { get; set; }
            public string OfficialContactno { get; set; }
            public string emailId { get; set; }
            public string PersonalEmail { get; set; }
            public string PersonalContactno { get; set; }
            public string currentAddress { get; set; }
            public string permanentAddress { get; set; }
            public string emrcontactpername { get; set; }
            public string emrcontactno { get; set; }

            public string? Outletcode { get; set; }
            public string? City { get; set; }

            // Newly added as per SP
            public string ESI_Appilcable { get; set; }
            public string PF_Appilcable { get; set; }
            public string IFC_code { get; set; }
            public string Account_no { get; set; }
            public string Bank_name { get; set; }

            // Extra fields you mentioned
            public string ESI_no { get; set; }
            public string Pf_no { get; set; }

            public string punchingempcode { get; set; }
            public string BioCode { get; set; }


            public string department { get; set; }

            public string designation { get; set; }

            public string functional_hod_code { get; set; }
            public string functional_rep_code { get; set; }

            //
            public string glposting { get; set; }

            public string? PfMaxlimit { get; set; }

            public string? Gender { get; set; }

            //public DateTime? leftdate { get; set; }
            public string? leftdate { get; set; }

            public string? Domicile { get; set; }
            public string? ServiceType { get; set; }
            public string? BusinessVertical { get; set; }
            public string? NomineeName { get; set; }
            public string? NomineeRelation { get; set; }
            public string? NomineeDOB { get; set; }
            public string? NomineeMobileNo { get; set; }
            public string? BGV { get; set; }

            // Newly Added Columns
            public string? Clientname { get; set; }
            [XmlElement("Secondary_ID")]
            public string? Secondary_ID { get; set; }
            public string? LocationName { get; set; }
            [XmlElement("Vendor_Name")]
            public string? Vendor_Name { get; set; }
            public string? VendorName { get; set; }
            public string? SkillCategory { get; set; }
            public string? BloodGroup { get; set; }
            public string? DOB { get; set; }
            public string? DOJ { get; set; }
            public string? LeavingReason { get; set; }
            public string? LeftRemarks { get; set; }
            [XmlElement("Current_City")]
            public string? Current_City { get; set; }
            [XmlElement("Current_State")]
            public string? Current_State { get; set; }
            [XmlElement("Current_Pincode")]
            public string? Current_Pincode { get; set; }
            [XmlElement("Permanent_City")]
            public string? Permanent_City { get; set; }
            [XmlElement("Permanent_State")]
            public string? Permanent_State { get; set; }
            [XmlElement("Permanent_Pincode")]
            public string? Permanent_Pincode { get; set; }
            [XmlElement("Biometric_ID")]
            public string? Biometric_ID { get; set; }
            public string? Role { get; set; }
            public string? State { get; set; }
            public string? Zone { get; set; }
            public string? AadharStatus { get; set; }
            public string? SourceType { get; set; }
            public string? SpouseName { get; set; }
            public string? MarriageDate { get; set; }
            public string? FunctionalReporting_Code { get; set; }
            public string? AdministrativeReporting_Code { get; set; }
            public string? FunctionalHOD_Code { get; set; }
            public string? AdministrativeHOD_Code { get; set; }
        }




        public class ExportImportSalaryOtherHeadRequest
        {
            public List<string>? heads { get; set; } = new List<string>();


            public string? EffectiveDate { get; set; } = "";


            public int? PageIndex { get; set; }
            public int? PageSize { get; set; }
            public string? EmpCode { get; set; } = "";
            public string? EmpCodeManual { get; set; } = "";
            public string? EmpName { get; set; } = "";
            public List<string> SelectedDepartments { get; set; } = new List<string>();
            public string? SelectedDesignation { get; set; } = "";
            public List<string>? SelectedLocations { get; set; } = new List<string>();
            public string? SelectedNature { get; set; } = "";
            public string? SelectedCity { get; set; } = "";
            public string? SortBy { get; set; } = ""; // Default sorting column       
            public string? fk_classid { get; set; } = "";
            public string? headtype { get; set; } = "";

            public string? fk_costcentreid { get; set; } = "";

        }



        [XmlRoot("NewDataSet")]
        public class ExpImpLeaverequest
        {
            [XmlElement("TempLeave")]
            public List<ExpImpLeaveDetails> Employees { get; set; }
        }

        public class ExpImpLeaveDetails
        {
            [XmlIgnore]
            public string pk_empid { get; set; }


            // public string EffectiveDate { get; set; }

            [XmlElement("fk_empid")]
            public string FkEmpId
            {
                get { return pk_empid; }
                set { pk_empid = value; }
            }

            public string EmpCode { get; set; }
            public string EmpName { get; set; }

            [XmlElement("currentyearleaves")]
            public string currentyearleaves { get; set; }

            [XmlElement("LeaveType")]
            public string LeaveType { get; set; }
        }





        public class ExportImportLeaveRequest
        {
            public int? PageIndex { get; set; }
            public int? PageSize { get; set; }
            public string? EmpCode { get; set; } = "";
            public string? EmpCodeManual { get; set; } = "";
            public string? EmpName { get; set; } = "";
            public List<string> SelectedDepartments { get; set; } = new List<string>();
            public string? SelectedDesignation { get; set; } = "";
            public List<string>? SelectedLocations { get; set; } = new List<string>();
            public string? SelectedNature { get; set; } = "";
            public string? SelectedCity { get; set; } = "";
            public string? SortBy { get; set; } = ""; // Default sorting column       
            public string? fk_classid { get; set; } = "";
            public string? headtype { get; set; } = "";

            //add new property for EportImport Leave
            public string? fk_costcentreid { get; set; } = "";
            public long fk_leaveid { get; set; }
            public string? empStatus { get; set; } = "";
        }
        public class ExportImportSalaryHeadRequest2
        {
            public int? PageIndex { get; set; }
            public int? PageSize { get; set; }
            public string? EmpCode { get; set; } = "";
            public string? EmpCodeManual { get; set; } = "";
            public string? EmpName { get; set; } = "";
            public List<string> SelectedDepartments { get; set; } = new List<string>();
            public string? SelectedDesignation { get; set; } = "";
            public List<string>? SelectedLocations { get; set; } = new List<string>();
            public string? SelectedNature { get; set; } = "";
            public string? SelectedCity { get; set; } = "";
            public string? SortBy { get; set; } = ""; // Default sorting column       
            public string? fk_classid { get; set; } = "";
            public string? headtype { get; set; } = "";
            public string fk_costcentreid { get; set; } = "";
            public string empStatus { get; set; } = "";

        }




        // fro daye wise
        public class exportAttendanceModeldaywise
        {

            public List<exportAttendanceDaywise> AttendanceNotmarked { get; set; }
            public List<dynamic> Attendancemarked { get; set; }
            public int NotMarkedCount { get; set; }
            public int MarkedCount { get; set; }
        }

        public class exportAttendanceDaywise

        {
            public long CID { get; set; }
            public string pk_empid { get; set; }
            public string empcode { get; set; }
            public string empname { get; set; }
            public string location { get; set; }
            public string department { get; set; }
            public string A1 { get; set; }
            public string A2 { get; set; }
            public string A3 { get; set; }
            public string A4 { get; set; }
            public string A5 { get; set; }
            public string A6 { get; set; }
            public string A7 { get; set; }
            public string A8 { get; set; }
            public string A9 { get; set; }
            public string A10 { get; set; }
            public string A11 { get; set; }
            public string A12 { get; set; }
            public string A13 { get; set; }
            public string A14 { get; set; }
            public string A15 { get; set; }
            public string A16 { get; set; }
            public string A17 { get; set; }
            public string A18 { get; set; }
            public string A19 { get; set; }
            public string A20 { get; set; }
            public string A21 { get; set; }
            public string A22 { get; set; }
            public string A23 { get; set; }
            public string A24 { get; set; }
            public string A25 { get; set; }
            public string A26 { get; set; }
            public string A27 { get; set; }
            public string A28 { get; set; }
            public string A29 { get; set; }
            public string A30 { get; set; }
            public string A31 { get; set; }
            public string PaidDays { get; set; }
        }

        //Import Attendance

        [XmlRoot("NewDataSet")]
        public class AttendanceDaywiseImportRequest
        {
            [XmlElement("SAL_Attendance_Daily")]
            public List<SAL_Attendance_Daily> SAL_Attendance_Daily { get; set; }

            //[XmlElement("EmpLeft")]
            //public List<EmpLeft> EmpLeftList { get; set; }
        }

        public class SAL_Attendance_Daily
        {
            public string? empcode { get; set; }

            [MaxLength(5, ErrorMessage = "A1 cannot exceed 5 characters.")]
            public string? A1 { get; set; }
            [MaxLength(5, ErrorMessage = "A2 cannot exceed 5 characters.")]
            public string? A2 { get; set; }
            [MaxLength(5, ErrorMessage = "A3 cannot exceed 5 characters.")]
            public string? A3 { get; set; }
            [MaxLength(5, ErrorMessage = "A4 cannot exceed 5 characters.")]
            public string? A4 { get; set; }
            [MaxLength(5, ErrorMessage = "A5 cannot exceed 5 characters.")]
            public string? A5 { get; set; }
            [MaxLength(5, ErrorMessage = "A6 cannot exceed 5 characters.")]
            public string? A6 { get; set; }
            [MaxLength(5, ErrorMessage = "A7 cannot exceed 5 characters.")]
            public string? A7 { get; set; }
            [MaxLength(5, ErrorMessage = "A8 cannot exceed 5 characters.")]
            public string? A8 { get; set; }
            [MaxLength(5, ErrorMessage = "A9 cannot exceed 5 characters.")]
            public string? A9 { get; set; }
            [MaxLength(5, ErrorMessage = "A10 cannot exceed 5 characters.")]
            public string? A10 { get; set; }
            [MaxLength(5, ErrorMessage = "A11 cannot exceed 5 characters.")]
            public string? A11 { get; set; }
            [MaxLength(5, ErrorMessage = "A12 cannot exceed 5 characters.")]
            public string? A12 { get; set; }
            [MaxLength(5, ErrorMessage = "A13 cannot exceed 5 characters.")]
            public string? A13 { get; set; }

            [MaxLength(5, ErrorMessage = "A14 cannot exceed 5 characters.")]
            public string? A14 { get; set; }
            [MaxLength(5, ErrorMessage = "A15 cannot exceed 5 characters.")]
            public string? A15 { get; set; }
            [MaxLength(5, ErrorMessage = "A16 cannot exceed 5 characters.")]
            public string? A16 { get; set; }
            [MaxLength(5, ErrorMessage = "A17 cannot exceed 5 characters.")]
            public string? A17 { get; set; }
            [MaxLength(5, ErrorMessage = "A18 cannot exceed 5 characters.")]
            public string? A18 { get; set; }
            [MaxLength(5, ErrorMessage = "A19 cannot exceed 5 characters.")]
            public string? A19 { get; set; }
            [MaxLength(5, ErrorMessage = "A20 cannot exceed 5 characters.")]
            public string? A20 { get; set; }
            [MaxLength(5, ErrorMessage = "A21 cannot exceed 5 characters.")]
            public string? A21 { get; set; }
            [MaxLength(5, ErrorMessage = "A22 cannot exceed 5 characters.")]
            public string? A22 { get; set; }
            [MaxLength(5, ErrorMessage = "A23 cannot exceed 5 characters.")]
            public string? A23 { get; set; }
            [MaxLength(5, ErrorMessage = "A24 cannot exceed 5 characters.")]
            public string? A24 { get; set; }
            [MaxLength(5, ErrorMessage = "A25 cannot exceed 5 characters.")]
            public string? A25 { get; set; }
            [MaxLength(5, ErrorMessage = "A26 cannot exceed 5 characters.")]
            public string? A26 { get; set; }
            [MaxLength(5, ErrorMessage = "A27 cannot exceed 5 characters.")]
            public string? A27 { get; set; }
            [MaxLength(5, ErrorMessage = "A28 cannot exceed 5 characters.")]
            public string? A28 { get; set; }
            [MaxLength(5, ErrorMessage = "A29 cannot exceed 5 characters.")]
            public string? A29 { get; set; }
            [MaxLength(5, ErrorMessage = "A30 cannot exceed 5 characters.")]
            public string? A30 { get; set; }
            [MaxLength(5, ErrorMessage = "A31 cannot exceed 5 characters.")]
            public string? A31 { get; set; }

            [MaxLength(5, ErrorMessage = "PaidDays cannot exceed 15 characters.")]
            public string? PaidDays { get; set; }
            public decimal? OTHrs { get; set; }
            public string? NightCountB { get; set; }
            public string? NightCountC { get; set; }
            public string? ArrearNightCountB { get; set; }
            public string? ArrearNightCountC { get; set; }
            public string? Holiday { get; set; }
            public string? NH { get; set; }
            public string? NFH { get; set; }
            public string? ArrearDays { get; set; }
            public string? NoticePayDecduction { get; set; }
            public string? Present { get; set; }
            public string? Weekoff { get; set; }
            public string? LeaveEncashDay { get; set; }
            public string? CompOff { get; set; }
            public string? LWP { get; set; }
            public string? IncentiveDays4 { get; set; }
            public string? IncentiveDays2 { get; set; }
            public string? ArrearOTHrs { get; set; }
            public string? ExtraDays { get; set; }
            public string? TotalDaysinMonth { get; set; }
            public string? WOP { get; set; }

        }

        //public class SAL_Attendance_Daily
        //{
        //    public string? empcode { get; set; }

        //    [MaxLength(5, ErrorMessage = "A1 cannot exceed 5 characters.")]
        //    public string? A1 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A2 cannot exceed 5 characters.")]
        //    public string? A2 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A3 cannot exceed 5 characters.")]
        //    public string? A3 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A4 cannot exceed 5 characters.")]
        //    public string? A4 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A5 cannot exceed 5 characters.")]
        //    public string? A5 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A6 cannot exceed 5 characters.")]
        //    public string? A6 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A7 cannot exceed 5 characters.")]
        //    public string? A7 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A8 cannot exceed 5 characters.")]
        //    public string? A8 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A9 cannot exceed 5 characters.")]
        //    public string? A9 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A10 cannot exceed 5 characters.")]
        //    public string? A10 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A11 cannot exceed 5 characters.")]
        //    public string? A11 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A12 cannot exceed 5 characters.")]
        //    public string? A12 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A13 cannot exceed 5 characters.")]
        //    public string? A13 { get; set; }

        //    [MaxLength(5, ErrorMessage = "A14 cannot exceed 5 characters.")]
        //    public string? A14 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A15 cannot exceed 5 characters.")]
        //    public string? A15 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A16 cannot exceed 5 characters.")]
        //    public string? A16 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A17 cannot exceed 5 characters.")]
        //    public string? A17 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A18 cannot exceed 5 characters.")]
        //    public string? A18 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A19 cannot exceed 5 characters.")]
        //    public string? A19 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A20 cannot exceed 5 characters.")]
        //    public string? A20 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A21 cannot exceed 5 characters.")]
        //    public string? A21 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A22 cannot exceed 5 characters.")]
        //    public string? A22 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A23 cannot exceed 5 characters.")]
        //    public string? A23 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A24 cannot exceed 5 characters.")]
        //    public string? A24 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A25 cannot exceed 5 characters.")]
        //    public string? A25 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A26 cannot exceed 5 characters.")]
        //    public string? A26 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A27 cannot exceed 5 characters.")]
        //    public string? A27 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A28 cannot exceed 5 characters.")]
        //    public string? A28 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A29 cannot exceed 5 characters.")]
        //    public string? A29 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A30 cannot exceed 5 characters.")]
        //    public string? A30 { get; set; }
        //    [MaxLength(5, ErrorMessage = "A31 cannot exceed 5 characters.")]
        //    public string? A31 { get; set; }

        //    [MaxLength(5, ErrorMessage = "PaidDays cannot exceed 15 characters.")]
        //    public string? PaidDays { get; set; }

        //    public decimal? OTHrs { get; set; }

        //    public string? NightCountB { get; set; }
        //    public string? NightCountC { get; set; }
        //    public string? ArrearNightCountB { get; set; }
        //    public string? ArrearNightCountC { get; set; }
        //    public string? Holiday { get; set; }
        //    public string? NH { get; set; }
        //    public string? NFH { get; set; }
        //    public string? ArrearDays { get; set; }
        //    public string? NoticePayDecduction { get; set; }

        //}



        public class CdoReportRequestModel
        {
            public int PageIndex1 { get; set; } = 0;
            public int PageSize1 { get; set; } = 10;
            public string EmpCode { get; set; } = "";
            public string EmpCodeManual { get; set; } = "";
            public string EmpName { get; set; } = "";
            public List<string> SelectedDepartments { get; set; } = new List<string>();
            public string SelectedDesignation { get; set; } = "";
            public List<string> SelectedLocations { get; set; } = new List<string>();
            public string SelectedNature { get; set; } = "";
            public string SelectedCity { get; set; } = "";
            public string SortBy { get; set; } = "";
            public string fk_yearId { get; set; } = "";
            public string fk_monthId { get; set; } = "";
            public string fk_costcentreid { get; set; } = "";
            public string ContractorName { get; set; } = "";
        }



        public class CDOImportDetail
        {
            [XmlIgnore]
            public int fk_monthId { get; set; }
            [XmlIgnore]
            public int fk_yearId { get; set; }

            [XmlElement("EmpCode")]
            public string EmpCode { get; set; }

            [XmlElement("EmpName")]
            public string EmpName { get; set; }


            [XmlElement("hours")]
            public decimal Hours { get; set; }

            [XmlElement("fk_empid")]
            public string fk_empId { get; set; }
        }


        [XmlRoot("NewDataSet")]
        public class CDOImportRequest

        {
            [XmlElement("SAL_CDO_Manual")]
            public List<CDOImportDetail> CdoDetails { get; set; }
        }



        public class CDOImportResultDetail
        {
            public string EmpCode { get; set; }
            public string EmpName { get; set; }
            public decimal? Hours { get; set; }
            public string RecordStatus { get; set; }  // "Inserted" | "Updated" | "Invalid"

            public string InvalidReason { get; set; }   //  new
        }


        [XmlRoot("NewDataSet")]
        public class CityImportRequest
        {
            [XmlElement("City")]
            public List<CityImportRow> Rows { get; set; } = new();
        }

        public class CityImportRow
        {
            public string? CityName { get; set; }
            /// <summary>Human-readable state name — SP resolves to fk_stateid from SAL_State_Mst</summary>
            public string? StateName { get; set; }
            /// <summary>Y / N</summary>
            public string? IsMetro { get; set; }
            /// <summary>Y / N</summary>
            public string? PTApp { get; set; }
            /// <summary>Y / N</summary>
            public string? LWFApp { get; set; }
            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }

        // Designation Master Import
        [XmlRoot("NewDataSet")]
        public class DesignationImportRequest
        {
            [XmlElement("Designation")]
            public List<DesignationImportRow> Rows { get; set; } = new();
        }

        public class DesignationImportRow
        {
            public string? Designation { get; set; }
            public string? LevelName { get; set; }
            public string? SeniorityLevel { get; set; }

            public string? Qualification { get; set; }
            public string? Remarks { get; set; }
            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }

        // Department Master Import
        [XmlRoot("NewDataSet")]
        public class DepartmentImportRequest
        {
            [XmlElement("Department")]
            public List<DepartmentImportRow> Rows { get; set; } = new();
        }

        public class DepartmentImportRow
        {
            public string? Department { get; set; }
            public string? DeptCode { get; set; }
            public string? HodCode { get; set; }
            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }

        // Location Master Import
        [XmlRoot("NewDataSet")]
        public class LocationImportRequest
        {
            [XmlElement("Location")]
            public List<LocationImportRow> Rows { get; set; } = new();
        }

        public class LocationImportRow
        {
            public string? LocName { get; set; }
            public string? OfficeType { get; set; }
            public string? Zone { get; set; }
            public string? LocationCode { get; set; } //added
            public string? StateName { get; set; } //added
            public string? CityName { get; set; }
            public string? ParentLocation { get; set; }
            public string? ContactPerson { get; set; }
            public string? Address { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
            public string? Fax { get; set; }
            public string? Remarks { get; set; }
            public string? Latitude { get; set; }
            public string? Longitude { get; set; }
            public string? MachineID { get; set; }
            public string? Distance { get; set; }
            public string? BonusBasedOn { get; set; }
            public string? AttendanceSource { get; set; }
            public string? LoginAllow { get; set; }
            public string? DailyAttenAllow { get; set; }
            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }


            public string? AreaManager { get; set; } //added
            public string? AreaManagerEmail { get; set; } //added
            public string? RegionalManager { get; set; } //added
            public string? RegionalManagerEmail { get; set; } //added
        }




        // Client Master Import
        [XmlRoot("NewDataSet")]
        public class ClientImportRequest
        {
            [XmlElement("Client")]
            public List<ClientImportRow> Rows { get; set; } = new();
        }

        public class ClientImportRow
        {
            public string? ClientCode { get; set; }
            public string? ClientName { get; set; }
            public string? EmpCodePrefix { get; set; }
            public string? Grouping { get; set; }
            public string? ContactPerson { get; set; }
            public string? EmailID { get; set; }
            public string? CINNo { get; set; }
            public string? TAN { get; set; }


            public string? GST { get; set; }
            public string? PAN { get; set; }

            public string? Address { get; set; }
            public string? CityName { get; set; }
            public string? StateName { get; set; }
            public string? ZoneName { get; set; }
            public string? Pincode { get; set; }
            public string? Phone { get; set; }
            public string? StartDate { get; set; }
            public string? EndDate { get; set; }
            public string? LeavePolicy { get; set; }
            public decimal? CommissionPercent { get; set; }
            public string? Service { get; set; }

            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }

        // Outlet Master Import
        [XmlRoot("NewDataSet")]
        public class OutletImportRequest
        {
            [XmlElement("Outlet")]
            public List<OutletImportRow> Rows { get; set; } = new();
        }

        public class OutletImportRow
        {
            public string? ClientName { get; set; }
            public string? OutletCode { get; set; }
            public string? OutletName { get; set; }
            public string? DealerCode { get; set; }
            public string? RetailType { get; set; }
            public string? Address { get; set; }
            public string? CityName { get; set; }
            public string? StateName { get; set; }
            public string? RegionName { get; set; }

            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }

        [XmlRoot("NewDataSet")]
        public class BranchImportRequest
        {
            [XmlElement("Branch")]
            public List<BranchImportRow> Rows { get; set; } = new();
        }

        public class BranchImportRow
        {

            public string? BranchName { get; set; }
            public string? BranchheadCode { get; set; }
            public string? Address { get; set; }
            public string? PhoneNumber { get; set; }
            public string? CityName { get; set; }
            public string? StateName { get; set; }
            public string? RegionName { get; set; }

            // Returned by SP
            public string? Status { get; set; }
            public string? Message { get; set; }
        }






    }
}