using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class CompanyConfigMst
    {

       
        [XmlRoot("NewDataSet")]
        public class CompanyConfigXmlModel
        {


            [XmlElement("SAL_Company_Config")]
            public SAL_Company_Config SAL_Company_Config { get; set; } 
            [XmlElement("Common_Client_Details")]
            public Common_Client_Details Common_Client_Details { get; set; }

            //added code LR starts

            [XmlElement("SAL_Company_Config_OTGrossHead")]
            public List<SAL_Company_Config_OTGrossHead> OTGrossHeadList { get; set; } = new List<SAL_Company_Config_OTGrossHead>();

            [XmlElement("SAL_Company_Config_OtherRateHead")]
            public List<SAL_Company_Config_OtherRateHead> OtherRateHeadList { get; set; } = new List<SAL_Company_Config_OtherRateHead>();

            //added code LR ends
        }

        public class SAL_Company_Config
        {
            public bool lifeinsurance_visible { get; set; }
            public bool lifeinsurance_mandatory { get; set; }
            public bool lifeinsurance_verification { get; set; }

            public bool vendor_Applicable { get; set; }
            public string? contractor_LabelName { get; set; }
            public bool? IsLMVendorExpense { get; set; }
            public bool isvalidateemployee { get; set; }
            public string? pk_companyId { get; set; }
            public decimal? pf_percent { get; set; }
            public decimal? pfmax_limit { get; set; }
            public decimal? pension_limit { get; set; }
            public decimal? ac1_percent { get; set; }
            public decimal? ac10_percent { get; set; }
            public decimal? ac2_percent { get; set; }
            public decimal? ac21_percent { get; set; }
            public decimal? ac22_percent { get; set; }
            public decimal? esi_percent { get; set; }
            public decimal? esi_emr_percent { get; set; }
            public decimal? esimax_limit { get; set; }
            public bool? pf_applicable { get; set; }
            public string? pfno { get; set; }
            public string? DBFFile_Code { get; set; }
            public string? DBFFile_Extn { get; set; }
            public bool? volpf_applicable { get; set; }
            public bool? esi_applicable { get; set; }
            public string? esino { get; set; }
            public string? gst_no { get; set; }
            public string? gst_state { get; set; }
            public string? esilocal_office { get; set; }
            public bool? pt_applicable { get; set; }
            public string? pt_certno { get; set; }
            public string? pto_circleno { get; set; }
            public bool? tds_applicable { get; set; }
            public bool? gratuity_applicable { get; set; }
            public int? esi_roundoff { get; set; }
            public decimal? bonuspercent { get; set; }
            public decimal? bonusmaxlimit { get; set; }
            public int? pf_roundoff { get; set; }
            public string? lettersno { get; set; }
            public bool? isAutoEmpcode { get; set; }
            public int? maxEmpcode { get; set; }
            public string? prefixEmpcode { get; set; }
            public string? fk_empid { get; set; }
            public byte[]? Timestamp { get; set; }
            public bool contractor_Applicable { get; set; }
            // added by pp 23/03/2026
            public bool isotprequired { get; set; }

            public bool showclientdetails { get; set; }


            //added code LR starts
            public long? fk_Bonusheadid { get; set; }
            public long? fk_OTheadid { get; set; }
            public decimal? multipleOT { get; set; } = 0;
            public long? fk_Basicheadid { get; set; }
            public long? fk_Incentiveheadid { get; set; }

            //added code LR ends

            // Onboarding Configuration
            public string? onboarding_hr_email { get; set; }

            public bool pan_visible { get; set; } = true;
            public bool pan_mandatory { get; set; }
            public bool pan_verification { get; set; }

            public bool aadhaar_visible { get; set; } = true;
            public bool aadhaar_mandatory { get; set; }
            public bool aadhaar_verification { get; set; }

            public bool basicinfo_visible { get; set; } = true;
            public bool basicinfo_mandatory { get; set; }

            public bool qualification_visible { get; set; } = true;
            public bool qualification_mandatory { get; set; }

            public bool experience_visible { get; set; } = true;
            public bool experience_mandatory { get; set; }

            public bool family_visible { get; set; } = true;
            public bool family_mandatory { get; set; }

            public bool voter_visible { get; set; }
            public bool voter_mandatory { get; set; }
            public bool voter_verification { get; set; }

            public bool bankaccount_visible { get; set; }
            public bool bankaccount_mandatory { get; set; }
            public bool bankaccount_verification { get; set; }

            public bool vehicle_insurance_visible { get; set; }
            public bool vehicle_insurance_mandatory { get; set; }

            public bool vehicle_rc_visible { get; set; }
            public bool vehicle_rc_mandatory { get; set; }

            public bool driving_licence_visible { get; set; }
            public bool driving_licence_mandatory { get; set; }

            public bool vendor_gst_visible { get; set; }
            public bool vendor_gst_mandatory { get; set; }

            public bool signature_visible { get; set; }
            public bool signature_mandatory { get; set; }

            public bool photograph_visible { get; set; }
            public bool photograph_mandatory { get; set; }

            public string? pf_basedon { get; set; }
            public string? lwf_basedon { get; set; }

            public bool eshram_visible { get; set; }
            public bool eshram_mandatory { get; set; }
            public bool eshram_verification { get; set; }

            public bool ayushman_visible { get; set; }
            public bool ayushman_mandatory { get; set; }
            public bool ayushman_verification { get; set; }

            // Per-section OCR Fields
            public bool? pan_ocr { get; set; }
            public bool? aadhaar_ocr { get; set; }
            public bool? voter_ocr { get; set; }

            public bool photograph_livecapture { get; set; }

            // Stamp Field
            public string? is_stamp { get; set; }

            public string? OTDivideDaysType { get; set; }

            public decimal? OTDivideDays { get; set; }

            public bool? OTpf_gross_part { get; set; }

            public bool? OTesi_gross_part { get; set; }
            public bool? clientwiseEmpprefix { get; set; }




        }

        public class CompanyStampUploadModel
        {
            public string CompanyId { get; set; }

            public IFormFile? Stamp { get; set; }

            public string? StampName { get; set; }
        }


        //added code LR starts
        public class SAL_Company_Config_OTGrossHead
        {
            public long OTGrossHeadId { get; set; }
        }

        public class SAL_Company_Config_OtherRateHead
        {
            public long OtherRateHeadId { get; set; }
        }

        //added code LR ends
        public class Common_Client_Details
        {
            public string? fk_companyId { get; set; }
            public string? fk_softwareid { get; set; }
            public string? fk_versionid { get; set; }
            public string? fk_userpricerangeid { get; set; }
            public string? fk_locpricerangeid { get; set; }
            public long? fk_clientid { get; set; }
            public string? compcode { get; set; }
            public string? contactperson { get; set; }
            public string? compname { get; set; }
            public string? creationdate { get; set; }
            public string? email { get; set; }
            public string? website { get; set; }
            public string? faxno { get; set; }
            public string? phone { get; set; }
            public string? mobile { get; set; }
            public string? regno { get; set; }
            public string? staxno { get; set; }
            public string? tanno { get; set; }
            public string? gst_no { get; set; }
            public string? gst_state { get; set; }
            public string? address1 { get; set; }
            public string? address2 { get; set; }
            public int? noofUsers { get; set; }
            public int? noofLocations { get; set; }
            public string? validityfrom { get; set; }
            public string? validityto { get; set; }
            public string? complogo { get; set; }
            public byte[]? complogobyte { get; set; }
            public bool? active { get; set; }
            public string? remarks { get; set; }

            //missing para
            public long ? pk_clientdetailid { get; set; }
            public string? clientstatus { get; set; }
            public string? payby { get; set; }
            public string? userid { get; set; }
            public string? password { get; set; }
            public string? dbIP { get; set; }
            public string? dbName { get; set; }
            public string? dbUid { get; set; }
            public string? dbPwd { get; set; }
        }


        public class GetByIdResult{

            public SAL_Company_Config SAL_Company_Config { get; set; }
            public Common_Client_Details Common_Client_Details { get; set; }
            
            //added code LR starts
            public List<SAL_Company_Config_OTGrossHead> OTGrossHeadList { get; set; }
            public List<SAL_Company_Config_OtherRateHead> OtherRateHeadList { get; set; }

            //added code LR ends
        }

        public class CompanyConfigResult
        {
            public long CID { get; set; }
            public string pk_companyId { get; set; }
            public string compcode { get; set; }
            public string compname { get; set; }
            public string address1 { get; set; }
            public string contactperson { get; set; }

            public bool contractor_Applicable { get; set; }

            public string Company_LogoPath { get; set; }
        }

        public class CompanyLogoUploadModel
        {
            public string CompanyId { get; set; }

            public IFormFile? Logo { get; set; }

            public string? LogoName { get; set; }
        }

        public class IsLMVendorExpenseResult
        {
            public bool IsLMVendorExpense { get; set; }
        }

    }
}
