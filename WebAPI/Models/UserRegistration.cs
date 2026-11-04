using HRMSWebAPI.Helper;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HRMSWebAPI.Models
{



    public class CompanyValidationResult
    {
        public string CompanyId { get; set; }
        public string CompanyCode { get; set; }

        public string CompanyName { get; set; }
    }


    public class CompanyCodeRequestModel
    {
        [Required]
        public string CompanyCode { get; set; }
    }

    public class LocationRequestModel
    {
        [Required]
        public string CompanyId { get; set; }

        [Required]
        public string OfficeTypeId { get; set; }
    }

    public class LoginModel
    {
        [Required]
        public string LoginId { get; set; }

        [Required]
        public string Password { get; set; }

        // [Required]
        public string? LocationId { get; set; }

        // [Required]
        public string? CompanyCode { get; set; }

        public string? UserType { get; set; }//employee user


    }
    //public class VerifyOtpAndLoginRequest
    //{
    //    public VerifyOTPModel VerifyOtp { get; set; }
    //    public LoginModel LoginDetails { get; set; }
    //}




    public class VerifyOTPModel
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        [OTPAnnotation]
        public string Otp { get; set; }

        public string? usertype { get; set; }
    }


    public class LoginResult
    {
        public bool IsLoginSuccessfull { get; set; }
        public bool IsValid { get; set; }
        public string Message { get; set; }

        public string UserName { get; set; }
        public string? CompanyName { get; set; }
        //added by shiv
        public int? pk_roleId { get; set; }
        public string? rolename { get; set; }

        public string? Name { get; set; }

        public string CompanyId { get; set; }

        public string UserId { get; set; }
        public string UserEmail { get; set; }// add this

        public string LocationId { get; set; }
        public string fk_locid { get; set; }

        public bool ContractorApplicable { get; set; }
        public string FinancialYearId { get; set; }

        public string Date1 { get; set; }

        public string Date2 { get; set; }
        public string? Otp { get; set; }
        public string? DepartmentId { get; set; }
        public string? LoginUserCode { get; set; }

        public string? contractor_LabelName { get; set; }




    }




    public class AppSettings
    {
        public string UploadsFolderPath { get; set; }
        public string PODUploadsFolderPath { get; set; }

        public string? AdminApiKey { get; internal set; }
        public string? CandidateFolderPath { get; set; }

        public string? LetterTemplatesFolderPath { get; set; }


        public string? CompanyLogoFolderPath { get; set; }

    }

    public class TokenRefreshRequest
    {
        public string RefreshToken { get; set; }

    }

    public class UserAuthenticationDetail
    {
        [Column("pk_userId")]  // Maps the DB column to PkUserId property
        public string pk_userId { get; set; }

        [Column("fk_roleId")]
        public int FkRoleId { get; set; }

        [Column("fk_empId")]
        public int? FkEmpId { get; set; } // Nullable since it can be NULL

        [Column("Active")]
        public bool Active { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("fathername")]
        public string FatherName { get; set; }


        [Column("email")]
        public string email { get; set; }

        public string otp { get; set; }
        //public string fk_locid { get; set; }


        [Column("UserId")]
        public string UserId { get; set; }












    }



    public class FinancialYearInfo
    {
        [Column("pk_finid")]
        public string PkFinId { get; set; }  // Financial Year Primary Key

        [Column("date1")]
        public string Date1 { get; set; }  // Start Date

        [Column("date2")]
        public string Date2 { get; set; }  // End Date

        [Column("pk_companyId")]
        public string PkCompanyId { get; set; }  // Company ID

        [Column("compname")]
        public string CompName { get; set; }  // Company Name

        [Column("CompanyName")]
        public string? CompanyName { get; set; }
    }

    public class RoleInfo
    {
        [Column("pk_roleId")]
        public int PkRoleId { get; set; }  // Primary Key for Role

        [Column("rolename")]
        public string RoleName { get; set; }  // Role Name (e.g., ADMINISTRATOR)

        [Column("mappedalias")]
        public string MappedAlias { get; set; }  // Alias (e.g., 'S')

        [Column("rolelevel")]
        public int RoleLevel { get; set; }  // Role Level (e.g., 1)

        [Column("remarks")]
        public string Remarks { get; set; }  // Description/Remarks
    }

    ///Employee Login
    ///

    public class EmpLoginModel
    {
        [Required]
        public string EmpLoginId { get; set; }

        [Required]
        public string Password { get; set; }

        public string? CompanyCode { get; set; }


    }

    public class EmpVerifyOTPModel
    {
        [Required]
        public string EmpId { get; set; }

        [Required]
        [OTPAnnotation]
        public string Otp { get; set; }

        // public string? LocationId { get; set; }
    }



    public class EmpLoginResult
    {
        public bool IsLoginSuccessfull { get; set; }
        public bool IsValid { get; set; }
        public string Message { get; set; }

        public string LoginEmpId { get; set; }

        public string LoginUserCode { get; set; }
        public string LoginUserName { get; set; }
        public string? CompanyName { get; set; }

        public string CompanyId { get; set; }

        public string Designation { get; set; }
        // add this

        public string Password { get; set; }
        public string Finid { get; set; }

        public string FinStartDate { get; set; }

        public string FinEndDate { get; set; }
        // public string? Otp { get; set; }





    }

    //for reset passowrd

    public class ResetPasswordRequest
    {
        public string UserType { get; set; } // "EMP" or "ADMIN"
        public string? UserId { get; set; }   // fk_empid or pk_userId
        public string NewPassword { get; set; }
    }

    public class VerifyOldPasswordRequest
    {
        public string OldPassword { get; set; }
        public string UserType { get; set; }
    }



  





    //}
 public class UnifiedLoginDetail
        {
            // ===== FIRST RESULT SET - Main Login Data =====

            [Column("LoginType")]
            public string LoginType { get; set; }

            [Column("ShowAdminSwitch")]
            public bool ShowAdminSwitch { get; set; }

            [Column("pk_userId")]
            public string pk_userId { get; set; }

            [Column("fk_roleId")]
            public int? fk_roleId { get; set; }

            [Column("UserId")]
            public string UserId { get; set; }

            [Column("name")]
            public string name { get; set; }

            [Column("email")]
            public string email { get; set; }

            [Column("fk_locid")]
            public string fk_locid { get; set; }

            [Column("FinStartDate")]
            public string FinStartDate { get; set; }

            [Column("FinEndDate")]
            public string FinEndDate { get; set; }

            [Column("FinancialYearId")]
            public string FinancialYearId { get; set; }

            [Column("CompanyCode")]
            public string CompanyCode { get; set; }

            [Column("CompanyName")]
            public string CompanyName { get; set; }

            [Column("CompanyId")]
            public string CompanyId { get; set; }

            // ===== THIRD RESULT SET - Financial Year Details =====
            [Column("pk_finid")]
            public string pk_finid { get; set; }

            [Column("date1")]
            public string date1 { get; set; }

            [Column("date2")]
            public string date2 { get; set; }

            [Column("compname")]
            public string compname { get; set; }

            // ===== FOURTH RESULT SET - Role Details =====
            [Column("pk_roleId")]
            public int? RoleId { get; set; }

            [Column("rolename")]
            public string RoleName { get; set; }

            [Column("mappedalias")]
            public string RoleAlias { get; set; }

            [Column("rolelevel")]
            public int? RoleLevel { get; set; }

            [Column("remarks")]
            public string RoleRemarks { get; set; }


        [Column("showclientdetails")]
        public bool showclientdetails { get; set; }


        [Column("isotprequired")]
        public bool isotprequired { get; set; }

        [Column("contractor_LabelName")]
        public string? contractor_LabelName { get; set; }

        [Column("Contractor_Applicable")]
        public bool? ContractorApplicable { get; set; }

        public bool? vendor_Applicable { get; set; }
        public bool? isAutoEmpcode { get; set; }

        // ===== Application-specific fields (not from SP) =====
        public string LoginUserCode { get; set; }
            public string Password { get; set; }
            public string Designation { get; set; }
            public string DepartmentId { get; set; }
            public bool IsLoginSuccessfull { get; set; }
            public string Message { get; set; }
        }


    public class SwitchEmployeeToAdminDto
    {
        public string EmpCode { get; set; }
        public string CompCode { get; set; }
    }


}





