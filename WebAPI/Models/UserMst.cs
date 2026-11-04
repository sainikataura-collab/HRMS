using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]

    public class UserMsttDataSet
    {
        [XmlElement("UM_Users_Mst")]
        public List<UserMst> UserMst { get; set; }
    }
    public class UserMst
    {
        public long? CID { get; set; }
        public string? pk_userId { get; set; }
        public string? fk_roleId { get; set; }
        public string? fk_empId { get; set; }
        public string? loginname { get; set; }
        public string? empname { get; set; }
        public string? RoleName { get; set; }
        public short? RoleLevel { get; set; }
        public string? password { get; set; }
        public string? oldPassword { get; set; }
        public bool? active { get; set; }
        public string? ActiveStatus { get; set; }
        public string? name { get; set; }
        public string? fathername { get; set; }
        public string? department { get; set; }
        public string? designation { get; set; }
        public string? email { get; set; }
        public string? remarks { get; set; }
        public string? fk_insUserID { get; set; }
        public string? fk_updUserID { get; set; }
        public string? fk_insDateID { get; set; }
        public string? fk_updDateID { get; set; }
        public byte[]? Timestamp { get; set; }
        public string? fk_companyId { get; set; }

        public bool? isVendor { get; set; }//added rupesh 22 sept2026
        public string? fk_vendorId { get; set; }//added rupesh 22 sept2026

        public int? TotalVendorCount { get; set; } //added shiv 9oct 2026
        public int? IncompleteVendorCount { get; set; } //added shiv 9oct 2026
    }



    public class PanVerification
    {


        [Required]
        [PANAnnotation]
        public string PanNo { get; set; }
    }


    public class PanApiResponse
    {
        public PanApiResponseData Data { get; set; }
        public object Error { get; set; }
        public string Message { get; set; }
        public int StatusCode { get; set; }
        public bool Success { get; set; }
        public string MessageCode { get; set; }
    }

    public class PanApiResponseData
    {
        [JsonPropertyName("client_id")]
        public string ClientId { get; set; }

        [JsonPropertyName("pan_number")]
        public string PanNumber { get; set; }

        [JsonPropertyName("full_name")]
        public string FullName { get; set; }

        [JsonPropertyName("category")]
        public string Category { get; set; }

        [JsonPropertyName("dob")]
        public string Dob { get; set; }


        [JsonPropertyName("status")]
        public string Status { get; set; }
    }



    public class GenerateOtpResponse
    {
        public GenerateOtpData Data { get; set; } // Contains the detailed response data
        public bool Success { get; set; } // Indicates whether the operation was successful
        public string Message { get; set; } // Any message from the API
        public int StatusCode { get; set; } // Status code from the API
    }

    public class GenerateOtpData
    {
        public string client_id { get; set; } // Client ID generated for this request
        public bool otp_sent { get; set; } // Whether OTP was successfully sent
        public bool if_number { get; set; } // Indicates if the Aadhaar number is valid
        public bool valid_aadhaar { get; set; } // Whether the Aadhaar number is valid
        public string status { get; set; } // Status of the OTP generation (e.g., "generate_otp_success")
    }
    public class AadhaarVerification
    {
        [Required]
        [AadhaarAnnotation]
        //[StringLength(12, ErrorMessage = "AadhaarNo must be 12 character  long.", MinimumLength = 12)]
        public string AadhaarNo { get; set; }
    }

    public class SubmitOtpRequest
    {
        public string client_id { get; set; } // Client ID from the Generate OTP process
        public string Otp { get; set; } // OTP entered by the user
    }



    public class SubmitData
    {
        public string client_id { get; set; }
        public string full_name { get; set; }
        public string aadhaar_number { get; set; }
        public string dob { get; set; }
        public string gender { get; set; }
        public Address address { get; set; }
        public string zip { get; set; }
        public bool mobile_verified { get; set; }
        public string status { get; set; }
    }

    public class SubmitOtpResponse
    {
        public SubmitData data { get; set; }
        public int status_code { get; set; }
        public bool success { get; set; }
        public object message { get; set; }
        public string message_code { get; set; }
    }

    public class Address
    {
        public string country { get; set; }
        public string dist { get; set; }
        public string state { get; set; }
        public string loc { get; set; }
        public string street { get; set; }
        public string house { get; set; }
        public string landmark { get; set; }
        public string zip { get; set; }
    }


    public class AadhaarModel
    {
        public string? pk_recId { get; set; }
        public string AadhaarNo { get; set; }
        public string AadhaarName { get; set; }
        public string AadhaarDob { get; set; }
        public string AadhaarAddress { get; set; }

        // State/City (ID-based, same as BasicInfo)
        public string? StateId { get; set; }
        public string? CityId { get; set; }
        public string? StateName { get; set; }   // for display in view mode
        public string? CityName { get; set; }    // for display in view mode

        public string? AadhaarFront { get; set; }  // saved path
        public string? AadhaarBack { get; set; }   // saved path

        // Father's Aadhaar Card
        public string? FatherAadhaarFront { get; set; }  // saved path
        public string? FatherAadhaarBack { get; set; }   // saved path

        [XmlIgnore]
        public IFormFile? AadhaarFrontFile { get; set; }

        [XmlIgnore]
        public IFormFile? AadhaarBackFile { get; set; }

        [XmlIgnore]
        public IFormFile? FatherAadhaarFrontFile { get; set; }

        [XmlIgnore]
        public IFormFile? FatherAadhaarBackFile { get; set; }
    }



    public class PANModel
    {
        public string? pk_recId { get; set; }
        public string PANNo { get; set; }       // Example: ABCDE1234F
        public string PANName { get; set; }     // Example: Ankit Mehra
        public string PANDob { get; set; }      // Example: 1985-10-15

        public string? PanCard { get; set; }    // Binary file data

        [XmlIgnore]
        public IFormFile? PanCardFile { get; set; }
    }


    public class BasicInfoModel
    {
        public string? pk_recId { get; set; }
        public string StateId { get; set; }
        public string? CityId { get; set; }
        public string Pincode { get; set; }
        public string? StateName { get; set; }
        public string? CityName { get; set; }
        public string Address { get; set; }
        public string? Photo { get; set; }

        // File Upload
        [XmlIgnore]
        public IFormFile? ProfileImageFile { get; set; }
    }

    public class OnBoardCandidateModel
    {
        public long CID { get; set; }
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }
        public string email { get; set; }
        public string mobile { get; set; }
        public string department { get; set; }
        public string designation { get; set; }
        public string onboardFormStatus { get; set; }
        public DateTime? onboardInitiatedDate { get; set; }
        public DateTime? onboardInprogressDate { get; set; }
        public DateTime? onboardCompletionDate { get; set; }
    }

    public class OnboardingDashboardResponse
    {
        public int TotalUsers { get; set; }
        public DashboardStats Stats { get; set; }
        public WeeklySummary WeeklySummary { get; set; }
        public MonthlySummary MonthlySummary { get; set; }
        public List<RecentOnboarding> RecentOnboardings { get; set; }
        public List<TimelineItem> Timeline { get; set; }
    }

    public class DashboardStats
    {
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int Initiated { get; set; }
        public int Total { get; set; }
    }

    public class WeeklySummary
    {
        public int ThisWeek { get; set; }
        public int LastWeek { get; set; }
        public int PendingApprovals { get; set; }
    }

    public class MonthlySummary
    {
        public int New { get; set; }
        public int Total { get; set; }
        public int Cancelled { get; set; }
    }

    public class RecentOnboarding
    {
        public string EmpId { get; set; }
        public string Name { get; set; }
        public string Dept { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public DateTime? InitiatedDate { get; set; }
        public DateTime? CompletionDate { get; set; }
    }

    public class TimelineItem
    {
        public string EmpId { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }

        public string Email { get; set; }
        public string Mobile { get; set; }
        public string Details { get; set; }
        public DateTime? ActivityDate { get; set; }
    }

    // SP Result Classes
    public class StatsResult
    {
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int Initiated { get; set; }
        public int Total { get; set; }
        public int TotalUsers { get; set; }
    }

    public class WeeklySummaryResult
    {
        public int ThisWeek { get; set; }
        public int LastWeek { get; set; }
        public int PendingApprovals { get; set; }
    }

    public class MonthlySummaryResult
    {
        public int NewThisMonth { get; set; }
        public int TotalThisMonth { get; set; }
        public int CancelledThisMonth { get; set; }
    }

    public class SendEmailRequestDto
    {
        public string Type { get; set; } // "CREDENTIALS" or "REMINDER"
        public List<UserMst> Users { get; set; }
        public bool SendToAll { get; set; } = false;
    }


}
