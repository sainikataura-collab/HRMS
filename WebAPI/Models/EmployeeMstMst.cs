
using iTextSharp.text.pdf;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]

    public class EmployeeMstDataSet
    {

        [XmlElement("SAL_Employee_Mst")]
        public EmployeeMst Employee { get; set; }


        [XmlElement("SAL_EmployeeOther_Details")]

        public EmployeeOtherDetails EmployeeOther { get; set; }


        [XmlElement("EmployeeShift")]

        public List<EmployeeShiftIns> employeeShiftIns { get; set; } = new List<EmployeeShiftIns>();

    }


    public class EmployeeMst
    {
        [XmlElement("isBlacklisted")]
        public bool? isBlacklisted { get; set; }

        [XmlElement("blacklistDate")]
        public string? blacklistDate { get; set; }

        [XmlElement("blacklistReason")]
        public string? blacklistReason { get; set; }

        [XmlElement("fk_classid")]
        public string? fk_classid { get; set; }

        [XmlElement("bgv")]
        public string? bgv { get; set; }

        [XmlElement("vendorId")]
        public string? vendorId { get; set; }

        [XmlIgnore]
        [XmlElement("pk_empid")]

        public string? pk_empid { get; set; }

        [XmlElement("fk_recId")]
        public string? fk_recId { get; set; }

        [XmlElement("empcode")]
        public string empcode { get; set; }

        [XmlElement("manualempcode")]
        public string? manualempcode { get; set; }

        [XmlElement("punchingempcode")]
        public string? punchingempcode { get; set; }


        [XmlElement("empname")]
        public string empname { get; set; }

        [XmlElement("fathername")]
        public string? fathername { get; set; }

        [XmlElement("mothername")]
        public string? mothername { get; set; }


        [XmlElement("fk_cityid")]
        public string fk_cityid { get; set; }

        [XmlElement("fk_deptid")]
        public string fk_deptid { get; set; }
        public string? fk_subdeptid { get; set; }
        public string? fk_RoleId { get; set; }


        [XmlElement("fk_locid")]
        public string fk_locid { get; set; }

        [XmlElement("fk_desgid")]
        public string fk_desgid { get; set; }

        [XmlElement("fk_natureid")]
        public string? fk_natureid { get; set; }

        [XmlElement("fk_costcentreid")]
        public long fk_costcentreid { get; set; }

        [XmlElement("fk_branchId")]
        public long? fk_branchId { get; set; }

        [XmlElement("fk_dealerOutletId")]
        public int? fk_dealerOutletId { get; set; }


        [XmlElement("fk_bankid")]
        public string? fk_bankid { get; set; }

        [XmlElement("bankaccountno")]
        public string? bankaccountno { get; set; }

        [XmlElement("panno")]
        public string? panno { get; set; }

        [XmlElement("dateofbirth")]
        public string? dateofbirth { get; set; }

        [XmlElement("dateofjoining")]
        public string? dateofjoining { get; set; }

        [XmlElement("dateOfConfirmation")]
        public string? dateOfConfirmation { get; set; }

        [XmlElement("SAFStartDate")]
        public string? SAFStartDate { get; set; }

        [XmlElement("contractenddate")]
        public string? contractenddate { get; set; }

        [XmlElement("resigndate")]
        public string? resigndate { get; set; }

        [XmlElement("employeeleftstatus")]
        public string employeeleftstatus { get; set; }


        //added new 

        
       
    
        


        [XmlElement("leftdate")]
        public string? leftdate { get; set; }

        [XmlElement("leftremarks")]
        public string? leftremarks { get; set; }

        [XmlElement("remarks")]
        public string? remarks { get; set; }

        [XmlElement("transferstatus")]
        public bool? transferstatus { get; set; }

        [XmlElement("email")]
        public string? email { get; set; }

        [XmlElement("active")]
        public bool? active { get; set; }


        [XmlElement("fk_zoneId")]
        public long? fk_zoneId { get; set; }

        //[XmlElement("fk_OperationalId")]
        //public long? fk_OperationalId { get; set; } = 0;


        [XmlElement("uanNo")]
        public string? uanNo { get; set; }

        [XmlElement("adhaarNo")]
        public string? adhaarNo { get; set; }

        [XmlElement("dateOfRelieving")]
        public string? dateOfRelieving { get; set; }

        [XmlElement("Debit_Card")]
        public string? Debit_Card { get; set; }

        //[XmlElement("Advance_Limit")]
        //public decimal? Advance_Limit { get; set; } = 0m; // or (decimal?)0


        [XmlElement("attendanceType")]
        public string? attendanceType { get; set; }

        [XmlElement("TransportType")]
        public string? TransportType { get; set; }

        [XmlElement("IFSCCODE")]
        public string? IFSCCODE { get; set; }


        [XmlElement("TaxRegime")]
        public string? TaxRegime { get; set; }
        [XmlElement("fk_rentCityId")]

        public string? fk_rentCityId { get; set; }


        [XmlElement("OverTimeType")]

        public string? OverTimeType { get; set; }

        //[XmlElement("attendanceSource")]

        //public string? attendanceSource { get; set; }

        [XmlElement("groupemployee")]

        public string? groupemployee { get; set; }
        [XmlElement("fk_CouponHODid")]

        public string? fk_CouponHODid { get; set; }

        [XmlElement("PLI")]
        public decimal? PLI { get; set; }
        [XmlElement("Accommodationstatus")]

        public string? Accommodationstatus { get; set; }
        [XmlElement("fk_AdministrativeRepempid")]

        public string? fk_AdministrativeRepempid { get; set; }
        [XmlElement("fk_FunctionalRepempid")]

        public string? fk_FunctionalRepempid { get; set; }
        [XmlElement("fk_AdministrativeHODempid")]

        public string? fk_AdministrativeHODempid { get; set; }
        [XmlElement("fk_FunctionalHODempid")]

        public string? fk_FunctionalHODempid { get; set; }

        [XmlElement("Domicile")]
        public string? Domicile { get; set; }

        [XmlElement("ServiceType")]
        public string? ServiceType { get; set; }

        [XmlElement("BusinessVertical")]
        public string? BusinessVertical { get; set; }


    }

    public class InsertEmployeeResult
    {
        public string pk_empid { get; set; }
    }

    public class EmplyeeUpd
    {

        public string pk_empid { get; set; }

    }

    public class EmployeeOtherDetails
    {
        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }

        [XmlElement("gender")]
        public string gender { get; set; }

        [XmlElement("fk_religionid")]
        public string fk_religionid { get; set; }

        [XmlElement("fk_catid")]
        public string fk_catid { get; set; }

        [XmlElement("pfno")]
        public string? pfno { get; set; }

        [XmlElement("esino")]
        public string? esino { get; set; }

        [XmlElement("esiZone")]
        public string? esiZone { get; set; }

        [XmlElement("corresContactNo")]
        public string? corresContactNo { get; set; }

        [XmlElement("permanentContactNo")]
        public string? permanentContactNo { get; set; }

        [XmlElement("PersonalEmail")]
        public string? PersonalEmail { get; set; }

        [XmlElement("PersonalContactno")]
        public string? PersonalContactno { get; set; }

        [XmlElement("OfficialContactno")]
        public string? OfficialContactno { get; set; }


        public string? fk_cityid_permanent { get; set; }
        public int? fk_stateid_permanent { get; set; }
        public string? Address_permanent { get; set; }
        public string? pincode_permanent { get; set; }
        public string? fk_cityid_current { get; set; }
        public int? fk_stateid_current { get; set; }
        public string? Address_current { get; set; }
        public string? pincode_current { get; set; }

    }


    public class EmployeeMaster
    {
        public string? vendorName { get; set; }
        public string? clientName { get; set; }
        public string? locationName { get; set; }
        public string? pk_empid { get; set; }

        public string CID { get; set; }
        public string empcode { get; set; }
        public string manualempcode { get; set; }
        public string empname { get; set; }
        public string Desig { get; set; }
        public string Depart { get; set; }

        public string? bankaccountno { get; set; }
        public string? panno { get; set; }
        public string? adhaarNo { get; set; }
        public string? MobileNo { get; set; }
        public string? uanNo { get; set; }
        public string? esiNo { get; set; }
        public string? Email { get; set; }
        public string? BankName { get; set; }
        public string? IFSCCODE { get; set; }


    }
    public class EmployeeAttendanceMst
    {
        public string? pk_empid { get; set; }
        public string? Intime { get; set; }
        public string? outtimeMinute { get; set; }
        public string? intimeMinute { get; set; }
        public string? Outtime { get; set; }
        public string? Gracetime { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }

        public string? fk_shiftId { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
        //add 18 june

        public string? geofence { get; set; }
        public string? attendanceSource { get; set; }
        public List<string> attendancelocation { get; set; }  // List instead of single string
        public bool? OTApp { get; set; }

    }
    public class EmployeeAttendanceDataSet
    {
        public List<AttendanceLocation> AttendanceLocations { get; set; }
    }
    public class AttendanceLocation
    {
        public string fk_empid { get; set; }
        public string attendancelocation { get; set; }
    }
    //---Employee Shift



    public class EmployeeShiftIns
    {
        public string? fk_empid { get; set; }
        public long? fk_shiftId { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
        public bool? IsActive { get; set; }
    }

    public class EmployeeOtherDetailsMst
    {
        public string? NomineeName { get; set; }
        public string? NomineeRelation { get; set; }
        public string? NomineeMobileNo { get; set; }
        public string? pk_empid { get; set; }
        public bool? pf_app { get; set; }
        public bool? esi_app { get; set; }
        public bool? lwfapplicable { get; set; }
        public decimal? pffixedamount { get; set; }
        public string pfno { get; set; }
        public bool? inESICycle { get; set; }
        public bool? proftax_app { get; set; }
        public bool? volpf_app { get; set; }
        public string esino { get; set; }
        public string? esiZone { get; set; }
        public decimal? volpfTypeAmt { get; set; }
        public bool? isreverse { get; set; }
        public bool? pfmaxlimit_app { get; set; }
        public string? volpfType { get; set; }

        public string? empcode { get; set; }
        public string? empname { get; set; }

        public bool? policy_app { get; set; }
        public string? policyNo { get; set; }
        public string? uanNo { get; set; }
        public decimal? policy_amount { get; set; }
        public DateTime? policyDate { get; set; }
        public DateTime? policyTillValid { get; set; }
        public string? policyImagePath { get; set; }
        public IFormFile? FileBytes { get; set; }

    }

    public class SalHeadAmountRequest
    {
        public string BasedOn { get; set; } // 'C' or 'B'
        public decimal? Amount { get; set; }
        public string LocId { get; set; }
        public string FkGradeId { get; set; }
        public bool PfApp { get; set; }
        public bool EsiApp { get; set; }
        public string? EffectiveDate { get; set; }
        public string? fk_empId { get; set; }
    }

    public class SalHeadAmountResponse
    {
        public long PkHeadId { get; set; }
        public string Description { get; set; }
        public string ShortDesc { get; set; }
        public string HeadType { get; set; }
        public string Mapping { get; set; }
        public decimal? Amount { get; set; }
        public string FkFormulaId { get; set; }
        public int DisplayOrder { get; set; }
        public int OrderLevel { get; set; }
        public string Rounding { get; set; }
        public bool BlockSummation { get; set; }
        public long FkHeadFixedId { get; set; }
        public string EffectDate { get; set; }
        public string Row { get; set; }
        public string isEnabled { get; set; }


    }
    [XmlRoot("EmployeeHead")]

    public class EmployeeHeadMstDataSet
    {

        [XmlElement("Head")]
        public List<EmployeeHeadDetails> Employeehead { get; set; } = new List<EmployeeHeadDetails>();
        public EmployeeHeadMst employeeHeadMst { get; set; }
    }
    public class EmployeeHeadDetails
    {

        [XmlElement("fk_empid")]
        public string? fk_empid { get; set; }
        [XmlElement("fk_headid")]
        public long? fk_headid { get; set; }

        public long? pk_headid { get; set; }

        [XmlElement("amount")]
        public decimal? amount { get; set; }

        [XmlElement("effectdate")]
        public string? effectdate { get; set; }
        public string? ShortDesc { get; set; }
    }
    public class EmployeeHeadMst
    {
        public string? pk_empid { get; set; }
        public decimal? amount { get; set; }
        public decimal? FixedIncomeTax { get; set; }
        public decimal ctc { get; set; }
        public decimal VariableCTCAmount { get; set; }
        public string? basedon { get; set; }
        public string? LocId { get; set; }
        public string? fk_locid { get; set; }

        public string? fk_classid { get; set; }
        public string? FkGradeId { get; set; }
        public decimal? JoiningBonus { get; set; }
        public decimal? RetentionBonus { get; set; }
        public decimal? ESOPS { get; set; }
        public string? RetentionFrequency { get; set; }
        public string? empcode { get; set; }
        public string? empname { get; set; }

        public string? glposting { get; set; }
    }

    //public class EmployeeHeadDetailsEdits
    //{
    //    public string? pk_empid { get; set; }
    //    public decimal? amount { get; set; }
    //    public decimal ctc { get; set; }
    //    public decimal VariableCTCAmount { get; set; }
    //    public string? basedon { get; set; }
    //    public string? LocId { get; set; }
    //    public string? FkGradeId { get; set; }
    //    public decimal? JoiningBonus { get; set; }
    //    public decimal? RetentionBonus { get; set; }
    //    public decimal? ESOPS { get; set; }
    //    public string? RetentionFrequency { get; set; }
    //    public string? fk_empid { get; set; }
    //    public long? fk_headid { get; set; }
    //    public DateTime? effectdate { get; set; }


    //}

}